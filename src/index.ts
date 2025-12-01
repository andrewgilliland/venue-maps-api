import { Hono } from "hono";
import { cors } from "hono/cors";

// import sectionsData from "./data/sections.json";

type Bindings = {
  VENUE_MAP_DATA: KVNamespace;
  VENUE_MAPS_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://d3bfy2q6taoc42.cloudfront.net",
    ], // Add your frontend URLs
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Hono JSON Server!",
    endpoints: ["/sections"],
  });
});

app.get("/sections", async (c) => {
  const sections = await c.env.VENUE_MAP_DATA.get("venue.json", {
    type: "json",
  });

  return c.json(sections);
});

// GET GeoJSON file
app.get("/sections/:filename", async (c) => {
  const filename = c.req.param("filename");

  const object = await c.env.VENUE_MAPS_BUCKET.get(`${filename}.json`);

  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const data = await object.json();
  return c.json(data);
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
