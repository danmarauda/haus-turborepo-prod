/**
 * Tenders - Document Management Functions
 *
 * Query and mutation functions for tender document management.
 * 
 * Tables:
 * - tenders: Document/project management
 * - tenderDocuments: Individual documents with storage integration
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// TENDER QUERIES
// ============================================================================

/**
 * Get a single tender by ID
 * Alias: getTender
 */
export const get = query({
  args: { id: v.id("tenders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Alias for get - getTender
 */
export const getTender = query({
  args: { id: v.id("tenders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List tenders with optional filters (by status, client)
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    clientName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("tenders");

    if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    if (args.clientName) {
      q = q.withIndex("by_clientName", (q) => q.eq("clientName", args.clientName));
    }

    const results = await q.take(args.limit ?? 50);
    return results;
  },
});

/**
 * Alias for list - listTenders
 */
export const listTenders = query({
  args: {
    status: v.optional(v.string()),
    clientName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("tenders");

    if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    if (args.clientName) {
      q = q.withIndex("by_clientName", (q) => q.eq("clientName", args.clientName));
    }

    const results = await q.take(args.limit ?? 50);
    return results;
  },
});

/**
 * Get tenders by status
 */
export const getByStatus = query({
  args: {
    status: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tenders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .take(args.limit ?? 50);
  },
});

/**
 * Get upcoming deadlines
 */
export const getUpcomingDeadlines = query({
  args: {
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cutoff = now + (args.days ?? 7) * 24 * 60 * 60 * 1000;

    const results = await ctx.db
      .query("tenders")
      .withIndex("by_deadline")
      .collect();

    return results
      .filter((t) => t.deadline >= now && t.deadline <= cutoff)
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, args.limit ?? 10);
  },
});

/**
 * Get tender with documents
 */
export const getWithDocuments = query({
  args: { id: v.id("tenders") },
  handler: async (ctx, args) => {
    const tender = await ctx.db.get(args.id);
    if (!tender) {
      return null;
    }

    const documents = await ctx.db
      .query("tenderDocuments")
      .withIndex("by_tenderId", (q) => q.eq("tenderId", args.id))
      .collect();

    return {
      ...tender,
      documents,
    };
  },
});

/**
 * Search tenders by name, client, or metadata
 */
export const searchTenders = query({
  args: {
    query: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    let q = ctx.db.query("tenders");

    // If status filter provided, use index first
    if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    const results = await q.collect();

    // Filter by search term across multiple fields
    const filtered = results.filter((tender) => {
      const nameMatch = tender.name.toLowerCase().includes(searchTerm);
      const clientMatch = tender.clientName.toLowerCase().includes(searchTerm);
      
      // Search in metadata if it exists
      let metadataMatch = false;
      if (tender.metadata) {
        const metadataStr = JSON.stringify(tender.metadata).toLowerCase();
        metadataMatch = metadataStr.includes(searchTerm);
      }

      return nameMatch || clientMatch || metadataMatch;
    });

    return filtered.slice(0, args.limit ?? 50);
  },
});

// ============================================================================
// TENDER MUTATIONS
// ============================================================================

/**
 * Create a new tender
 * Alias: createTender
 */
export const create = mutation({
  args: {
    name: v.string(),
    clientName: v.string(),
    deadline: v.float64(),
    value: v.optional(v.float64()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("tenders", {
      ...args,
      status: args.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Alias for create - createTender
 */
export const createTender = mutation({
  args: {
    name: v.string(),
    clientName: v.string(),
    deadline: v.float64(),
    value: v.optional(v.float64()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("tenders", {
      ...args,
      status: args.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a tender
 */
export const update = mutation({
  args: {
    id: v.id("tenders"),
    name: v.optional(v.string()),
    clientName: v.optional(v.string()),
    deadline: v.optional(v.float64()),
    value: v.optional(v.float64()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Tender not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Update tender status
 * Alias: updateTenderStatus
 */
export const updateStatus = mutation({
  args: {
    id: v.id("tenders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const tender = await ctx.db.get(args.id);
    if (!tender) {
      throw new Error("Tender not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true, status: args.status };
  },
});

/**
 * Alias for updateStatus - updateTenderStatus
 */
export const updateTenderStatus = mutation({
  args: {
    id: v.id("tenders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const tender = await ctx.db.get(args.id);
    if (!tender) {
      throw new Error("Tender not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true, status: args.status };
  },
});

/**
 * Delete a tender and its documents
 * Alias: deleteTender
 */
export const remove = mutation({
  args: { id: v.id("tenders") },
  handler: async (ctx, args) => {
    // Delete associated documents first
    const documents = await ctx.db
      .query("tenderDocuments")
      .withIndex("by_tenderId", (q) => q.eq("tenderId", args.id))
      .collect();

    for (const doc of documents) {
      // Delete from storage if storageId exists
      if (doc.storageId) {
        await ctx.storage.delete(doc.storageId);
      }
      await ctx.db.delete(doc._id);
    }

    // Delete the tender
    await ctx.db.delete(args.id);
    return { success: true, documentsDeleted: documents.length };
  },
});

/**
 * Alias for remove - deleteTender
 */
export const deleteTender = mutation({
  args: { id: v.id("tenders") },
  handler: async (ctx, args) => {
    // Delete associated documents first
    const documents = await ctx.db
      .query("tenderDocuments")
      .withIndex("by_tenderId", (q) => q.eq("tenderId", args.id))
      .collect();

    for (const doc of documents) {
      // Delete from storage if storageId exists
      if (doc.storageId) {
        await ctx.storage.delete(doc.storageId);
      }
      await ctx.db.delete(doc._id);
    }

    // Delete the tender
    await ctx.db.delete(args.id);
    return { success: true, documentsDeleted: documents.length };
  },
});

// ============================================================================
// TENDER DOCUMENT QUERIES
// ============================================================================

/**
 * Get a single tender document by ID
 * Alias: getDocumentById
 */
export const getDocument = query({
  args: { id: v.id("tenderDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Alias for getDocument - getDocumentById
 */
export const getDocumentById = query({
  args: { id: v.id("tenderDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get documents by tender
 * Alias: getTenderDocuments
 */
export const getDocumentsByTender = query({
  args: {
    tenderId: v.id("tenders"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("tenderDocuments")
      .withIndex("by_tenderId", (q) => q.eq("tenderId", args.tenderId));

    if (args.type) {
      q = q.filter((q) => q.eq(q.field("type"), args.type));
    }

    return await q.collect();
  },
});

/**
 * Alias for getDocumentsByTender - getTenderDocuments
 */
export const getTenderDocuments = query({
  args: {
    tenderId: v.id("tenders"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("tenderDocuments")
      .withIndex("by_tenderId", (q) => q.eq("tenderId", args.tenderId));

    if (args.type) {
      q = q.filter((q) => q.eq(q.field("type"), args.type));
    }

    return await q.collect();
  },
});

// ============================================================================
// TENDER DOCUMENT MUTATIONS
// ============================================================================

/**
 * Add a document to a tender
 * Alias: addDocument
 * 
 * Supports storage integration - pass storageId from generateUploadUrl
 */
export const addDocument = mutation({
  args: {
    tenderId: v.id("tenders"),
    name: v.string(),
    type: v.string(),
    content: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Verify tender exists
    const tender = await ctx.db.get(args.tenderId);
    if (!tender) {
      throw new Error("Tender not found");
    }

    const documentId = await ctx.db.insert("tenderDocuments", {
      name: args.name,
      tenderId: args.tenderId,
      type: args.type,
      content: args.content || "",
      fileUrl: args.fileUrl,
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });

    // Update tender's updatedAt
    await ctx.db.patch(args.tenderId, {
      updatedAt: Date.now(),
    });

    return { success: true, documentId };
  },
});

/**
 * Update a tender document
 */
export const updateDocument = mutation({
  args: {
    id: v.id("tenderDocuments"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Document not found");
    }

    await ctx.db.patch(id, updates);

    // Update tender's updatedAt
    await ctx.db.patch(existing.tenderId, {
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Delete a tender document
 * Alias: deleteDocument
 * 
 * Also removes the file from storage if storageId exists
 */
export const removeDocument = mutation({
  args: { id: v.id("tenderDocuments") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete from storage if storageId exists
    if (document.storageId) {
      await ctx.storage.delete(document.storageId);
    }

    await ctx.db.delete(args.id);

    // Update tender's updatedAt
    await ctx.db.patch(document.tenderId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Alias for removeDocument - deleteDocument
 */
export const deleteDocument = mutation({
  args: { id: v.id("tenderDocuments") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete from storage if storageId exists
    if (document.storageId) {
      await ctx.storage.delete(document.storageId);
    }

    await ctx.db.delete(args.id);

    // Update tender's updatedAt
    await ctx.db.patch(document.tenderId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample tenders and documents
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    const sampleTenders = [
      {
        name: "Sydney Office Fitout",
        clientName: "Acme Corporation",
        deadline: now + oneWeek * 2,
        value: 250000,
        status: "active",
        metadata: { location: "Sydney CBD", sqm: 500, category: "commercial" },
      },
      {
        name: "Residential Development - Stage 1",
        clientName: "Metro Homes Pty Ltd",
        deadline: now + oneWeek * 4,
        value: 1500000,
        status: "active",
        metadata: { units: 12, location: "Parramatta", category: "residential" },
      },
      {
        name: "Retail Store Renovation",
        clientName: "Fashion Forward",
        deadline: now + oneWeek,
        value: 75000,
        status: "draft",
        metadata: { location: "Bondi Junction", category: "retail" },
      },
      {
        name: "Warehouse Extension",
        clientName: "Logistics Plus",
        deadline: now - oneWeek, // Past deadline
        value: 500000,
        status: "completed",
        metadata: { location: "Western Sydney", category: "industrial" },
      },
      {
        name: "Medical Centre Refurbishment",
        clientName: "Health Care Partners",
        deadline: now + oneWeek * 3,
        value: 320000,
        status: "active",
        metadata: { location: "North Sydney", category: "medical", compliance: "strict" },
      },
    ];

    const tenderIds = [];
    for (const tender of sampleTenders) {
      const id = await ctx.db.insert("tenders", {
        ...tender,
        createdAt: now,
        updatedAt: now,
      });
      tenderIds.push(id);
    }

    // Add sample documents to first tender
    const sampleDocuments = [
      {
        name: "Project Specifications.pdf",
        tenderId: tenderIds[0],
        type: "pdf",
        content: "Technical specifications for the office fitout project including floor plans, electrical layouts, and material requirements.",
        fileUrl: "https://example.com/specs.pdf",
      },
      {
        name: "Site Plans.pdf",
        tenderId: tenderIds[0],
        type: "pdf",
        content: "Detailed site plans showing existing structure and proposed modifications.",
        fileUrl: "https://example.com/plans.pdf",
      },
      {
        name: "Budget Estimate.xlsx",
        tenderId: tenderIds[0],
        type: "spreadsheet",
        content: "Detailed cost breakdown including materials, labor, and contingency.",
      },
      {
        name: "Contract Terms.docx",
        tenderId: tenderIds[0],
        type: "document",
        content: "Standard contract terms and conditions for the project.",
      },
    ];

    const documentIds = [];
    for (const doc of sampleDocuments) {
      const id = await ctx.db.insert("tenderDocuments", {
        ...doc,
        uploadedAt: now,
      });
      documentIds.push(id);
    }

    return {
      tendersInserted: tenderIds.length,
      documentsInserted: documentIds.length,
      tenderIds,
      documentIds,
    };
  },
});
