/**
 * Property Uploads - Convex functions for document vault
 * 
 * Handles CRUD operations for user-uploaded property documents
 * and AI analysis results. Integrates with propertyUploads table
 * in the Convex schema.
 */

import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// =============================================================================
// Types
// =============================================================================

export type SourceType = "image" | "document" | "url" | "manual";
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";
export type DocumentCategory = 
  | "contract" 
  | "report" 
  | "photo" 
  | "id" 
  | "payslip" 
  | "bank_statement" 
  | "other";

// =============================================================================
// Queries
// =============================================================================

/**
 * List user's uploaded documents
 * 
 * Returns paginated list of documents with optional category filter
 */
export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const limit = args.limit ?? 50;

    // Query documents by user
    let documents;
    if (args.category) {
      documents = await ctx.db
        .query("propertyUploads")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("metadata").field("category"), args.category))
        .order("desc")
        .take(limit);
    } else {
      documents = await ctx.db
        .query("propertyUploads")
        .withIndex("by_userId_uploaded", (q) => q.eq("userId", userId))
        .order("desc")
        .take(limit);
    }

    // Map to client-friendly format
    return documents.map((doc) => ({
      id: doc._id,
      uploadId: doc.uploadId,
      name: doc.filename ?? "Untitled",
      category: (doc.metadata?.category as DocumentCategory) ?? "other",
      size: doc.size ?? 0,
      mimeType: doc.mimeType ?? "application/octet-stream",
      uploadedAt: doc.uploadedAt,
      storageUrl: doc.storageId ? `/api/storage/${doc.storageId}` : undefined,
      thumbnailUrl: doc.sourceType === "image" && doc.storageId 
        ? `/api/storage/${doc.storageId}` 
        : undefined,
      analysis: doc.analysis ? {
        status: doc.analysis.status,
        propertyType: doc.analysis.propertyType,
        estimatedBedrooms: doc.analysis.estimatedBedrooms,
        estimatedBathrooms: doc.analysis.estimatedBathrooms,
        condition: doc.analysis.condition,
        features: doc.analysis.features,
        priceRange: doc.analysis.priceRange,
        description: doc.analysis.description,
        confidence: doc.analysis.confidence,
        analyzedAt: doc.analysis.analyzedAt,
        error: doc.analysis.error,
      } : undefined,
      propertyId: doc.propertyId,
      roomId: doc.roomId,
    }));
  },
});

/**
 * Get a single document by uploadId
 */
export const get = query({
  args: {
    uploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const doc = await ctx.db
      .query("propertyUploads")
      .withIndex("by_uploadId", (q) => q.eq("uploadId", args.uploadId))
      .unique();

    if (!doc || doc.userId !== userId) {
      throw new Error("Document not found");
    }

    return {
      id: doc._id,
      uploadId: doc.uploadId,
      name: doc.filename ?? "Untitled",
      category: (doc.metadata?.category as DocumentCategory) ?? "other",
      size: doc.size ?? 0,
      mimeType: doc.mimeType ?? "application/octet-stream",
      uploadedAt: doc.uploadedAt,
      storageUrl: doc.storageId ? `/api/storage/${doc.storageId}` : undefined,
      thumbnailUrl: doc.sourceType === "image" && doc.storageId 
        ? `/api/storage/${doc.storageId}` 
        : undefined,
      analysis: doc.analysis,
      propertyId: doc.propertyId,
      roomId: doc.roomId,
      sourceType: doc.sourceType,
    };
  },
});

/**
 * Get documents by property
 */
export const byProperty = query({
  args: {
    propertyId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const documents = await ctx.db
      .query("propertyUploads")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .order("desc")
      .take(100);

    return documents.filter((doc) => doc.userId === userId);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new property upload record
 * 
 * Called after file is uploaded to storage
 */
export const create = mutation({
  args: {
    sourceType: v.union(
      v.literal("image"),
      v.literal("document"),
      v.literal("url"),
      v.literal("manual")
    ),
    storageId: v.optional(v.id("_storage")),
    filename: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    category: v.optional(v.string()),
    propertyId: v.optional(v.string()),
    roomId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const docId = await ctx.db.insert("propertyUploads", {
      uploadId,
      userId,
      sourceType: args.sourceType,
      storageId: args.storageId,
      propertyId: args.propertyId,
      roomId: args.roomId,
      analysis: undefined,
      filename: args.filename,
      mimeType: args.mimeType,
      size: args.size,
      metadata: {
        ...args.metadata,
        category: args.category,
      },
      tags: [],
      uploadedAt: now,
      updatedAt: now,
    });

    // If it's an image, auto-queue for analysis if category is 'photo'
    if (args.sourceType === "image" && args.category === "photo") {
      // Schedule analysis action (async)
      await ctx.scheduler.runAfter(0, api.propertyUploads.analyzeImage, {
        uploadId,
      });
    }

    return uploadId;
  },
});

/**
 * Update document metadata
 */
export const update = mutation({
  args: {
    uploadId: v.string(),
    filename: v.optional(v.string()),
    category: v.optional(v.string()),
    propertyId: v.optional(v.string()),
    roomId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const doc = await ctx.db
      .query("propertyUploads")
      .withIndex("by_uploadId", (q) => q.eq("uploadId", args.uploadId))
      .unique();

    if (!doc || doc.userId !== userId) {
      throw new Error("Document not found");
    }

    const updates: Partial<Doc<"propertyUploads">> = {
      updatedAt: Date.now(),
    };

    if (args.filename !== undefined) updates.filename = args.filename;
    if (args.propertyId !== undefined) updates.propertyId = args.propertyId;
    if (args.roomId !== undefined) updates.roomId = args.roomId;
    if (args.metadata !== undefined) {
      updates.metadata = {
        ...doc.metadata,
        ...args.metadata,
        category: args.category ?? doc.metadata?.category,
      };
    }

    await ctx.db.patch(doc._id, updates);
    return args.uploadId;
  },
});

/**
 * Delete a document
 */
export const remove = mutation({
  args: {
    uploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const doc = await ctx.db
      .query("propertyUploads")
      .withIndex("by_uploadId", (q) => q.eq("uploadId", args.uploadId))
      .unique();

    if (!doc || doc.userId !== userId) {
      throw new Error("Document not found");
    }

    // Delete storage file if exists
    if (doc.storageId) {
      await ctx.storage.delete(doc.storageId);
    }

    // Delete document record
    await ctx.db.delete(doc._id);
    return true;
  },
});

/**
 * Request AI analysis for an image
 */
export const requestAnalysis = mutation({
  args: {
    uploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const doc = await ctx.db
      .query("propertyUploads")
      .withIndex("by_uploadId", (q) => q.eq("uploadId", args.uploadId))
      .unique();

    if (!doc || doc.userId !== userId) {
      throw new Error("Document not found");
    }

    if (doc.sourceType !== "image") {
      throw new Error("Analysis only available for images");
    }

    // Update status to pending
    await ctx.db.patch(doc._id, {
      analysis: {
        status: "pending",
      },
      updatedAt: Date.now(),
    });

    // Schedule analysis action
    await ctx.scheduler.runAfter(0, api.propertyUploads.analyzeImage, {
      uploadId: args.uploadId,
    });

    return true;
  },
});

// =============================================================================
// Actions
// =============================================================================

/**
 * Analyze image with AI
 * 
 * This action fetches the image from storage, converts to base64,
 * and calls the AI analysis action.
 */
export const analyzeImage = action({
  args: {
    uploadId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get document
    const doc = await ctx.runQuery(api.propertyUploads.get, {
      uploadId: args.uploadId,
    });

    if (!doc) {
      throw new Error("Document not found");
    }

    // Update status to processing
    await ctx.runMutation(api.propertyUploads._updateAnalysisStatus, {
      uploadId: args.uploadId,
      status: "processing",
    });

    try {
      // Get image data from storage
      let imageBase64: string;
      
      if (doc.storageUrl) {
        // Fetch image from storage
        const response = await fetch(doc.storageUrl);
        const blob = await response.blob();
        
        // Convert to base64
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data URL prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        throw new Error("No image data available");
      }

      // Call AI analysis
      const analysis = await ctx.runAction(api.ai.analyzeProperty, {
        imageBase64,
      });

      // Update document with analysis results
      await ctx.runMutation(api.propertyUploads._updateAnalysisResults, {
        uploadId: args.uploadId,
        analysis: {
          status: "completed",
          propertyType: analysis.propertyType,
          estimatedBedrooms: analysis.estimatedBedrooms,
          estimatedBathrooms: analysis.estimatedBathrooms,
          condition: analysis.condition,
          features: analysis.features,
          priceRange: analysis.priceRangeAUD,
          description: analysis.marketingDescription,
          confidence: 0.85, // AI SDK doesn't provide confidence directly
          analyzedAt: Date.now(),
        },
      });

      return analysis;
    } catch (error) {
      // Update status to failed
      await ctx.runMutation(api.propertyUploads._updateAnalysisStatus, {
        uploadId: args.uploadId,
        status: "failed",
        error: error instanceof Error ? error.message : "Analysis failed",
      });

      throw error;
    }
  },
});

// =============================================================================
// Internal Mutations (for actions to call)
// =============================================================================

/**
 * Update analysis status (internal use)
 */
export const _updateAnalysisStatus = mutation({
  args: {
    uploadId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("propertyUploads")
      .withIndex("by_uploadId", (q) => q.eq("uploadId", args.uploadId))
      .unique();

    if (!doc) {
      throw new Error("Document not found");
    }

    const analysis = doc.analysis ?? {};
    
    await ctx.db.patch(doc._id, {
      analysis: {
        ...analysis,
        status: args.status,
        ...(args.error && { error: args.error }),
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update analysis results (internal use)
 */
export const _updateAnalysisResults = mutation({
  args: {
    uploadId: v.string(),
    analysis: v.object({
      status: v.literal("completed"),
      propertyType: v.optional(v.string()),
      estimatedBedrooms: v.optional(v.number()),
      estimatedBathrooms: v.optional(v.number()),
      condition: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      priceRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
      description: v.optional(v.string()),
      confidence: v.optional(v.number()),
      analyzedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("propertyUploads")
      .withIndex("by_uploadId", (q) => q.eq("uploadId", args.uploadId))
      .unique();

    if (!doc) {
      throw new Error("Document not found");
    }

    await ctx.db.patch(doc._id, {
      analysis: args.analysis,
      updatedAt: Date.now(),
    });
  },
});
