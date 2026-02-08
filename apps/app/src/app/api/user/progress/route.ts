import { type NextRequest, NextResponse } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@v1/backend/convex/_generated/api";
import { auth } from "@/lib/auth";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { handleApiError, createValidationError } from "@/lib/error-handler";
import { z } from "zod";

// Validation schemas
const addXpSchema = z.object({
  action: z.literal("addXp"),
  amount: z.number().int().positive(),
});

const completeLessonSchema = z.object({
  action: z.literal("completeLesson"),
  lessonId: z.string().min(1),
  xpReward: z.number().int().nonnegative().optional(),
});

const updateStreakSchema = z.object({
  action: z.literal("updateStreak"),
});

const progressActionSchema = z.union([addXpSchema, completeLessonSchema, updateStreakSchema]);

/**
 * GET /api/user/progress
 * Get current user progress
 */
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimitResult = await checkRateLimit(`progress:${ip}`, apiRateLimit);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: Object.fromEntries(Object.entries(rateLimitResult.headers).filter(([,v]) => v !== undefined)) as Record<string, string>
        }
      );
    }

    // Get user progress
    let progress = await fetchQuery(api.userProgress.getByUserId, {
      userId: session.user.id,
    });

    // If no progress exists, initialize it
    if (!progress) {
      const initResult = await fetchMutation(api.userProgress.initialize, {
        userId: session.user.id,
      });

      if (initResult.created) {
        // Fetch again after initialization
        progress = await fetchQuery(api.userProgress.getByUserId, {
          userId: session.user.id,
        });
      }
    }

    // Get user's achievements
    const achievements = await fetchQuery(api.academy.getUserAchievements, {
      userId: session.user.id,
    });

    // Calculate next level XP threshold
    const currentLevel = progress?.level || 1;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const currentXp = progress?.xp || 0;
    const xpProgress = currentXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const levelProgress = Math.min(Math.round((xpProgress / xpNeeded) * 100), 100);

    const processingTime = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {
      "X-Request-ID": requestId,
      "X-Processing-Time": processingTime.toString(),
    };
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      if (value !== undefined) responseHeaders[key] = value;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          },
          progress: progress || {
            userId: session.user.id,
            xp: 0,
            level: 1,
            streak: 0,
            completedLessons: [],
            completedAchievements: [],
            stats: {
              propertiesViewed: 0,
              searchesMade: 0,
              reportsGenerated: 0,
              documentsUploaded: 0,
            },
          },
          achievements,
          level: {
            current: currentLevel,
            xp: currentXp,
            xpForNextLevel,
            xpProgress,
            xpNeeded,
            progress: levelProgress,
          },
        },
        meta: {
          requestId,
          processingTime,
          timestamp: new Date().toISOString(),
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("[Progress API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}

/**
 * POST /api/user/progress
 * Add XP or complete lesson
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimitResult = await checkRateLimit(`progress:post:${ip}`, apiRateLimit);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: Object.fromEntries(Object.entries(rateLimitResult.headers).filter(([,v]) => v !== undefined)) as Record<string, string>
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = progressActionSchema.safeParse(body);

    if (!validation.success) {
      throw createValidationError(
        "request body",
        validation.error.errors.map((e) => e.message).join(", ")
      );
    }

    const actionData = validation.data;
    let result;

    switch (actionData.action) {
      case "addXp": {
        result = await fetchMutation(api.userProgress.addXp, {
          userId: session.user.id,
          xp: actionData.amount,
        });
        break;
      }

      case "completeLesson": {
        result = await fetchMutation(api.userProgress.completeLesson, {
          userId: session.user.id,
          lessonId: actionData.lessonId,
          xpReward: actionData.xpReward || 0,
        });
        break;
      }

      case "updateStreak": {
        result = await fetchMutation(api.userProgress.updateStreak, {
          userId: session.user.id,
        });
        break;
      }

      default: {
        throw createValidationError("action", "Invalid action type");
      }
    }

    // Get updated progress
    const updatedProgress = await fetchQuery(api.userProgress.getByUserId, {
      userId: session.user.id,
    });

    const processingTime = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {
      "X-Request-ID": requestId,
      "X-Processing-Time": processingTime.toString(),
    };
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      if (value !== undefined) responseHeaders[key] = value;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          action: actionData.action,
          result,
          progress: updatedProgress,
        },
        meta: {
          requestId,
          processingTime,
          timestamp: new Date().toISOString(),
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("[Progress API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}
