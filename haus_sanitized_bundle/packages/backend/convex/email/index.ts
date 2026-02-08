import { v } from "convex/values";
import { action } from "../_generated/server";

export const subscribe = action({
  args: {
    email: v.string(),
    userGroup: v.string(),
  },
  handler: async (ctx, args) => {
    const loopsFormId = process.env.LOOPS_FORM_ID;

    if (!loopsFormId) {
      throw new Error("LOOPS_FORM_ID environment variable not configured");
    }

    const res = await fetch(
      `https://app.loops.so/api/newsletter-form/${loopsFormId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: args.email,
          userGroup: args.userGroup,
        }),
      },
    );

    const json = await res.json();

    return json;
  },
});
