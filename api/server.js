import { createServer } from "node:http";
import pg from "pg";

const { Pool } = pg;
const port = Number(process.env.PORT || 3000);
const pool = new Pool({
  max: 5,
  idleTimeoutMillis: 30_000,
});

function reply(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2_000) throw new Error("payload_too_large");
  }
  return JSON.parse(body || "{}");
}

const server = createServer(async (request, response) => {
  const startedAt = Date.now();
  let status = 500;

  try {
    if (request.method === "GET" && request.url === "/api/health") {
      await pool.query("SELECT 1");
      status = 200;
      return reply(response, status, { status: "ok" });
    }

    if (request.method === "GET" && request.url === "/api/notes") {
      const result = await pool.query(
        "SELECT id, message, created_at FROM notes ORDER BY id DESC LIMIT 20",
      );
      status = 200;
      return reply(response, status, { notes: result.rows });
    }

    if (request.method === "POST" && request.url === "/api/notes") {
      const input = await readJson(request);
      const message = typeof input.message === "string" ? input.message.trim() : "";
      if (!message || message.length > 500) {
        status = 400;
        return reply(response, status, { error: "message_invalid" });
      }
      const result = await pool.query(
        "INSERT INTO notes(message) VALUES ($1) RETURNING id, message, created_at",
        [message],
      );
      status = 201;
      return reply(response, status, { note: result.rows[0] });
    }

    status = 404;
    return reply(response, status, { error: "not_found" });
  } catch (error) {
    console.error(JSON.stringify({ event: "request_error", error: error.message }));
    status = error.message === "payload_too_large" ? 413 : 500;
    return reply(response, status, { error: "request_failed" });
  } finally {
    console.log(JSON.stringify({
      event: "request",
      method: request.method,
      path: request.url,
      status,
      duration_ms: Date.now() - startedAt,
    }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ event: "server_started", port }));
});

async function shutdown(signal) {
  console.log(JSON.stringify({ event: "shutdown", signal }));
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
