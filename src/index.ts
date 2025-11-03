import { Hono } from "hono";
import { cors } from "hono/cors";

import sectionsData from "./data/sections.json";

const app = new Hono();

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URLs
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Load JSON data from files
const sections = sectionsData;

// Root endpoint
app.get("/", (c) => {
  return c.json({
    message: "Welcome to Hono JSON Server!",
    endpoints: ["/sections"],
  });
});

app.get("/sections", (c) => {
  return c.json(sections);
});

// create a post endpoint the accepts a json body and returns it
app.post("/sections", async (c) => {
  try {
    const body = await c.req.json();

    console.log("Received body:", body);

    // Write the body data to venue.json file
    // const filePath = join(process.cwd(), "src", "data", "venue.json");
    // await writeFile(filePath, JSON.stringify(body, null, 2), "utf8");

    console.log("Data saved to venue.json successfully!");

    return c.json({
      success: true,
      message: "Data saved to venue.json",
      data: body,
    });
  } catch (error) {
    console.error("Error saving to file:", error);
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
