import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { connectDb, disconnectDb } from "./db/connection.js";
import { fileRequestsRoutes } from "./routes/fileRequests.js";
import { mockS3Routes } from "./routes/mockS3.js";

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_ORIGIN_RAW = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

function getAllowedOrigins(): string[] {
  return FRONTEND_ORIGIN_RAW.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
}

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const MONGODB_URI_VALUE = MONGODB_URI;

const app = new Hono();

app.use(
  "*",
  cors({
    origin: getAllowedOrigins(),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/file-requests", fileRequestsRoutes);
app.route("/mock-s3", mockS3Routes);

async function main() {
  await connectDb(MONGODB_URI_VALUE);
  console.log("Connected to MongoDB");

  const { serve } = await import("@hono/node-server");
  const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`Backend running at http://localhost:${info.port}`);
  });

  function shutdown() {
    server.close(() => {
      disconnectDb()
        .then(() => {
          console.log("Disconnected from MongoDB");
          process.exit(0);
        })
        .catch((err) => {
          console.error(err);
          process.exit(1);
        });
    });
  }
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
