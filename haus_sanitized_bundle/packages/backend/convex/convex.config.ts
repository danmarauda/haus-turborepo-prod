import polar from "@convex-dev/polar/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

// Configure Polar for Stripe subscriptions
app.use(polar);

export default app;
