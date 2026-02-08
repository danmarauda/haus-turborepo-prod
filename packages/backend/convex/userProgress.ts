/**
 * User Progress - Gamification Functions
 *
 * Query and mutation functions for user gamification including:
 * - XP and level tracking
 * - Streak tracking
 * - Stats tracking
 * - Achievement progress
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user progress by ID
 */
export const get = query({
  args: { id: v.id("userProgress") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get user progress by user ID
 */
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get leaderboard (top users by XP)
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allProgress = await ctx.db.query("userProgress").collect();

    return allProgress
      .sort((a, b) => b.xp - a.xp)
      .slice(0, args.limit ?? 10)
      .map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        xp: p.xp,
        level: p.level,
        streak: p.streak,
      }));
  },
});

/**
 * Get user stats
 */
export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      return null;
    }

    return {
      xp: progress.xp,
      level: progress.level,
      streak: progress.streak,
      lastActiveDate: progress.lastActiveDate,
      completedLessons: progress.completedLessons.length,
      completedAchievements: progress.completedAchievements.length,
      stats: progress.stats,
    };
  },
});

/**
 * Get users by level
 */
export const getByLevel = query({
  args: {
    level: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allProgress = await ctx.db.query("userProgress").collect();

    return allProgress
      .filter((p) => p.level === args.level)
      .slice(0, args.limit ?? 50);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Initialize user progress for a new user
 */
export const initialize = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user progress already exists
    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return { id: existing._id, created: false };
    }

    const today = new Date().toISOString().split("T")[0];

    const id = await ctx.db.insert("userProgress", {
      userId: args.userId,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: today,
      completedLessons: [],
      completedAchievements: [],
      stats: {
        propertiesViewed: 0,
        searchesMade: 0,
        reportsGenerated: 0,
        documentsUploaded: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id, created: true };
  },
});

/**
 * Add XP to a user
 */
export const addXp = mutation({
  args: {
    userId: v.string(),
    xp: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      throw new Error("User progress not found");
    }

    const newXp = progress.xp + args.xp;
    const newLevel = calculateLevel(newXp);

    await ctx.db.patch(progress._id, {
      xp: newXp,
      level: newLevel,
      updatedAt: Date.now(),
    });

    return {
      xp: newXp,
      level: newLevel,
      xpGained: args.xp,
      levelUp: newLevel > progress.level,
    };
  },
});

/**
 * Update streak (call daily)
 */
export const updateStreak = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      throw new Error("User progress not found");
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = getYesterday();

    let newStreak = progress.streak;

    if (progress.lastActiveDate === today) {
      // Already active today, no change
      return { streak: newStreak, updated: false };
    } else if (progress.lastActiveDate === yesterday) {
      // Consecutive day, increment streak
      newStreak = progress.streak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    await ctx.db.patch(progress._id, {
      streak: newStreak,
      lastActiveDate: today,
      updatedAt: Date.now(),
    });

    return { streak: newStreak, updated: true };
  },
});

/**
 * Complete a lesson
 */
export const completeLesson = mutation({
  args: {
    userId: v.string(),
    lessonId: v.string(),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      throw new Error("User progress not found");
    }

    // Check if already completed
    if (progress.completedLessons.includes(args.lessonId)) {
      return { success: false, reason: "Lesson already completed" };
    }

    const newXp = progress.xp + args.xpReward;
    const newLevel = calculateLevel(newXp);

    await ctx.db.patch(progress._id, {
      xp: newXp,
      level: newLevel,
      completedLessons: [...progress.completedLessons, args.lessonId],
      updatedAt: Date.now(),
    });

    return {
      success: true,
      xp: newXp,
      level: newLevel,
      xpGained: args.xpReward,
      levelUp: newLevel > progress.level,
    };
  },
});

/**
 * Unlock an achievement
 */
export const unlockAchievement = mutation({
  args: {
    userId: v.string(),
    achievementId: v.string(),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      throw new Error("User progress not found");
    }

    // Check if already unlocked
    if (progress.completedAchievements.includes(args.achievementId)) {
      return { success: false, reason: "Achievement already unlocked" };
    }

    const newXp = progress.xp + args.xpReward;
    const newLevel = calculateLevel(newXp);

    await ctx.db.patch(progress._id, {
      xp: newXp,
      level: newLevel,
      completedAchievements: [...progress.completedAchievements, args.achievementId],
      updatedAt: Date.now(),
    });

    return {
      success: true,
      xp: newXp,
      level: newLevel,
      xpGained: args.xpReward,
      levelUp: newLevel > progress.level,
    };
  },
});

/**
 * Update user stats
 */
export const updateStats = mutation({
  args: {
    userId: v.string(),
    statType: v.union(
      v.literal("propertiesViewed"),
      v.literal("searchesMade"),
      v.literal("reportsGenerated"),
      v.literal("documentsUploaded")
    ),
    increment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      throw new Error("User progress not found");
    }

    const stats = progress.stats || {
      propertiesViewed: 0,
      searchesMade: 0,
      reportsGenerated: 0,
      documentsUploaded: 0,
    };

    const increment = args.increment ?? 1;

    await ctx.db.patch(progress._id, {
      stats: {
        ...stats,
        [args.statType]: (stats[args.statType] || 0) + increment,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete user progress (GDPR)
 */
export const remove = mutation({
  args: { id: v.id("userProgress") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample user progress data
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleUsers = [
      {
        userId: "user-1",
        xp: 1250,
        level: 5,
        streak: 7,
        completedLessons: ["lesson-1", "lesson-2", "lesson-3"],
        completedAchievements: ["achievement-1", "achievement-2"],
        stats: {
          propertiesViewed: 45,
          searchesMade: 23,
          reportsGenerated: 2,
          documentsUploaded: 5,
        },
      },
      {
        userId: "user-2",
        xp: 500,
        level: 3,
        streak: 3,
        completedLessons: ["lesson-1"],
        completedAchievements: ["achievement-1"],
        stats: {
          propertiesViewed: 12,
          searchesMade: 8,
          reportsGenerated: 0,
          documentsUploaded: 1,
        },
      },
      {
        userId: "user-3",
        xp: 2100,
        level: 8,
        streak: 14,
        completedLessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-4"],
        completedAchievements: ["achievement-1", "achievement-2", "achievement-3"],
        stats: {
          propertiesViewed: 89,
          searchesMade: 45,
          reportsGenerated: 5,
          documentsUploaded: 12,
        },
      },
    ];

    const today = new Date().toISOString().split("T")[0];
    const ids = [];

    for (const user of sampleUsers) {
      const existing = await ctx.db
        .query("userProgress")
        .withIndex("by_userId", (q) => q.eq("userId", user.userId))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("userProgress", {
          ...user,
          lastActiveDate: today,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        ids.push(id);
      }
    }

    return { inserted: ids.length, ids };
  },
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate level based on XP
 * Uses exponential curve: level = floor(sqrt(xp / 100)) + 1
 */
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}
