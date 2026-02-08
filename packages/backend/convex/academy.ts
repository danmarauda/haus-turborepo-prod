/**
 * Academy - Lessons and Achievements Functions
 *
 * Query and mutation functions for:
 * - Lesson content management
 * - Achievement definitions
 * - User progress tracking for academy content
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// LESSON QUERIES
// ============================================================================

/**
 * Get a single lesson by ID
 */
export const getLesson = query({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a lesson by its string ID
 */
export const getLessonById = query({
  args: { lessonId: v.string() },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("id"), args.lessonId))
      .take(1);
    return lessons[0] || null;
  },
});

/**
 * List all lessons
 */
export const listLessons = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("lessons");

    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }

    const results = await q.collect();

    // Sort by order field
    return results.sort((a, b) => a.order - b.order).slice(0, args.limit ?? 100);
  },
});

/**
 * Get lessons by category
 */
export const getLessonsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("lessons")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    return results.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get lessons for a specific course
 */
export const getLessonsByCourse = query({
  args: { courseId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();

    return results.sort((a, b) => a.order - b.order);
  },
});

// ============================================================================
// ACHIEVEMENT QUERIES
// ============================================================================

/**
 * Get a single achievement by ID
 */
export const getAchievement = query({
  args: { id: v.id("achievements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get an achievement by its string ID
 */
export const getAchievementById = query({
  args: { achievementId: v.string() },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("id"), args.achievementId))
      .take(1);
    return achievements[0] || null;
  },
});

/**
 * List all achievements
 */
export const listAchievements = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("achievements");

    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }

    const results = await q.take(args.limit ?? 100);
    return results;
  },
});

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

/**
 * Get user's unlocked achievements with details
 */
export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get user progress
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!userProgress) {
      return { unlocked: [], locked: [], totalXp: 0 };
    }

    // Get all achievements
    const allAchievements = await ctx.db.query("achievements").collect();

    // Separate unlocked and locked
    const unlocked = allAchievements.filter((a) =>
      userProgress.completedAchievements.includes(a.id)
    );
    const locked = allAchievements.filter(
      (a) => !userProgress.completedAchievements.includes(a.id)
    );

    const totalXp = unlocked.reduce((sum, a) => sum + a.xpReward, 0);

    return {
      unlocked,
      locked,
      totalXp,
      unlockedCount: unlocked.length,
      totalCount: allAchievements.length,
    };
  },
});

// ============================================================================
// LESSON MUTATIONS
// ============================================================================

/**
 * Create a new lesson
 */
export const createLesson = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    duration: v.number(),
    xpReward: v.number(),
    order: v.number(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    courseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate ID
    const existing = await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (existing) {
      throw new Error(`Lesson with ID "${args.id}" already exists`);
    }

    return await ctx.db.insert("lessons", args);
  },
});

/**
 * Update a lesson
 */
export const updateLesson = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    xpReward: v.optional(v.number()),
    order: v.optional(v.number()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Lesson not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

/**
 * Delete a lesson
 */
export const removeLesson = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================================
// ACHIEVEMENT MUTATIONS
// ============================================================================

/**
 * Create a new achievement
 */
export const createAchievement = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    xpReward: v.number(),
    category: v.string(),
    requirement: v.object({
      type: v.string(),
      target: v.number(),
      metric: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Check for duplicate ID
    const existing = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (existing) {
      throw new Error(`Achievement with ID "${args.id}" already exists`);
    }

    return await ctx.db.insert("achievements", args);
  },
});

/**
 * Update an achievement
 */
export const updateAchievement = mutation({
  args: {
    id: v.id("achievements"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    xpReward: v.optional(v.number()),
    requirement: v.optional(
      v.object({
        type: v.string(),
        target: v.number(),
        metric: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Achievement not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

/**
 * Delete an achievement
 */
export const removeAchievement = mutation({
  args: { id: v.id("achievements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample lessons
 */
export const seedLessons = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleLessons = [
      {
        id: "lesson-1",
        title: "Introduction to Property Buying",
        description: "Learn the basics of buying your first property in Australia.",
        category: "buying",
        duration: 15,
        xpReward: 100,
        order: 1,
        content: "# Introduction to Property Buying\n\nBuying property is a significant milestone...",
        courseId: "course-buying-101",
      },
      {
        id: "lesson-2",
        title: "Understanding Property Finance",
        description: "Mortgages, deposits, and financing options explained.",
        category: "buying",
        duration: 20,
        xpReward: 150,
        order: 2,
        content: "# Understanding Property Finance\n\nBefore you start looking at properties...",
        courseId: "course-buying-101",
      },
      {
        id: "lesson-3",
        title: "Property Inspection Checklist",
        description: "What to look for when inspecting a property.",
        category: "buying",
        duration: 25,
        xpReward: 200,
        order: 3,
        content: "# Property Inspection Checklist\n\nWhen inspecting a property, pay attention to...",
        courseId: "course-buying-101",
      },
      {
        id: "lesson-4",
        title: "Investment Property Basics",
        description: "Getting started with property investment.",
        category: "investing",
        duration: 30,
        xpReward: 250,
        order: 1,
        content: "# Investment Property Basics\n\nProperty investment can be a great way to...",
        courseId: "course-investing-101",
      },
      {
        id: "lesson-5",
        title: "Selling Your Property",
        description: "Steps to successfully sell your property.",
        category: "selling",
        duration: 20,
        xpReward: 150,
        order: 1,
        content: "# Selling Your Property\n\nWhen it's time to sell, preparation is key...",
        courseId: "course-selling-101",
      },
    ];

    const ids = [];
    for (const lesson of sampleLessons) {
      const existing = await ctx.db
        .query("lessons")
        .filter((q) => q.eq(q.field("id"), lesson.id))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("lessons", lesson);
        ids.push(id);
      }
    }

    return { inserted: ids.length, ids };
  },
});

/**
 * Seed with sample achievements
 */
export const seedAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleAchievements = [
      {
        id: "achievement-1",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        xpReward: 50,
        category: "learning",
        requirement: {
          type: "count",
          target: 1,
          metric: "lessons_completed",
        },
      },
      {
        id: "achievement-2",
        title: "Knowledge Seeker",
        description: "Complete 5 lessons",
        icon: "📚",
        xpReward: 150,
        category: "learning",
        requirement: {
          type: "count",
          target: 5,
          metric: "lessons_completed",
        },
      },
      {
        id: "achievement-3",
        title: "Property Explorer",
        description: "View 10 properties",
        icon: "🏠",
        xpReward: 100,
        category: "exploration",
        requirement: {
          type: "count",
          target: 10,
          metric: "properties_viewed",
        },
      },
      {
        id: "achievement-4",
        title: "Search Master",
        description: "Perform 20 property searches",
        icon: "🔍",
        xpReward: 200,
        category: "exploration",
        requirement: {
          type: "count",
          target: 20,
          metric: "searches_made",
        },
      },
      {
        id: "achievement-5",
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon: "🔥",
        xpReward: 300,
        category: "engagement",
        requirement: {
          type: "streak",
          target: 7,
          metric: "daily_login",
        },
      },
      {
        id: "achievement-6",
        title: "Level 5 Reached",
        description: "Reach level 5",
        icon: "⭐",
        xpReward: 500,
        category: "milestone",
        requirement: {
          type: "level",
          target: 5,
        },
      },
    ];

    const ids = [];
    for (const achievement of sampleAchievements) {
      const existing = await ctx.db
        .query("achievements")
        .filter((q) => q.eq(q.field("id"), achievement.id))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("achievements", achievement);
        ids.push(id);
      }
    }

    return { inserted: ids.length, ids };
  },
});

/**
 * Seed all academy content
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const lessonsResult = await seedLessons.handler(ctx);
    const achievementsResult = await seedAchievements.handler(ctx);

    return {
      lessons: lessonsResult,
      achievements: achievementsResult,
    };
  },
});
