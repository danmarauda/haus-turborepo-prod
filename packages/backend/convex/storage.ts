/**
 * Storage - Convex storage utilities
 * 
 * Handles file storage operations including upload URL generation
 * and storage management.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a signed URL for uploading a file
 * 
 * Clients call this to get a URL, then POST the file directly to that URL.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get file URL by storage ID
 */
export const getUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage
 */
export const remove = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.storage.delete(args.storageId);
    return true;
  },
});
