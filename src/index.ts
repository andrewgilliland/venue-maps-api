import { Hono } from "hono";
import { cors } from "hono/cors";

import sectionsData from "./data/sections.json";

type Bindings = {
  VENUE_MAP_DATA: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URLs
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

const sections = sectionsData;

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Hono JSON Server!",
    endpoints: ["/sections"],
  });
});

app.get("/sections", (c) => {
  return c.json(sections);
});

app.post("/sections", async (c) => {
  try {
    const body = await c.req.json();

    await c.env.VENUE_MAP_DATA.put("venue.json", JSON.stringify(body, null, 2));

    return c.json({
      success: true,
      message: "Data saved to KV storage",
      data: body,
    });
  } catch (error) {
    console.error("Error saving to KV storage:", error);
    return c.json(
      {
        success: false,
        message: "Failed to save data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default app;
