import { type NextRequest, NextResponse } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@v1/backend/convex/_generated/api";
import { auth } from "@/lib/auth";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { handleApiError, createValidationError } from "@/lib/error-handler";
import { z } from "zod";

// Validation schemas
const completeLessonSchema = z.object({
  lessonId: z.string().min(1),
  xpReward: z.number().int().positive().default(0),
});

/**
 * GET /api/academy/lessons
 * List lessons by category
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
    const rateLimitResult = await checkRateLimit(`academy:${ip}`, apiRateLimit);

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

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const category = searchParams.get("category") || undefined;
    const courseId = searchParams.get("courseId") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

    // Call Convex query
    const lessons = await fetchQuery(api.academy.listLessons, {
      category,
      limit,
    });

    // Filter by courseId if specified
    const filteredLessons = courseId
      ? lessons.filter((l: { courseId?: string }) => l.courseId === courseId)
      : lessons;

    // Get user's progress to include completion status
    const userProgress = await fetchQuery(api.userProgress.getByUserId, {
      userId: session.user.id,
    });

    // Enrich lessons with completion status
    const enrichedLessons = filteredLessons.map((lesson: { id: string; category: string; xpReward?: number }) => ({
      ...lesson,
      isCompleted: userProgress?.completedLessons?.includes(lesson.id) || false,
    }));

    // Calculate stats
    const stats = {
      total: enrichedLessons.length,
      completed: enrichedLessons.filter((l: { isCompleted: boolean }) => l.isCompleted).length,
      categories: [...new Set(enrichedLessons.map((l: { category: string }) => l.category))],
      totalXp: enrichedLessons
        .filter((l: { isCompleted: boolean; xpReward?: number }) => l.isCompleted)
        .reduce((sum: number, l: { xpReward?: number }) => sum + (l.xpReward || 0), 0),
    };

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
          lessons: enrichedLessons,
          count: enrichedLessons.length,
          stats,
          filters: {
            category,
            courseId,
            limit,
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
    console.error("[Academy API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}

/**
 * POST /api/academy/lessons
 * Complete a lesson (mark as done)
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
    const rateLimitResult = await checkRateLimit(`academy:post:${ip}`, apiRateLimit);

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
    const validation = completeLessonSchema.safeParse(body);

    if (!validation.success) {
      throw createValidationError(
        "request body",
        validation.error.errors.map((e) => e.message).join(", ")
      );
    }

    const { lessonId, xpReward } = validation.data;

    // Verify lesson exists
    const lessons = await fetchQuery(api.academy.listLessons, { limit: 200 });
    const lesson = lessons.find((l: { id: string }) => l.id === lessonId);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Complete the lesson
    const result = await fetchMutation(api.userProgress.completeLesson, {
      userId: session.user.id,
      lessonId,
      xpReward: xpReward || (lesson as { xpReward?: number }).xpReward || 0,
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
          result,
          lesson: {
            id: (lesson as { id: string }).id,
            title: (lesson as { title: string }).title,
            xpReward: xpReward || (lesson as { xpReward?: number }).xpReward || 0,
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
    console.error("[Academy API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}
