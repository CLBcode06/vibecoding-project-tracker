import app from "../../server/app.js";

// Explicit route ensures Vercel forwards /api/tasks/:id for PUT and DELETE.
export default function handler(req, res) {
  const rawId = req.query?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return res.status(400).json({ error: "Task ID is required." });
  req.url = `/api/tasks/${encodeURIComponent(String(id))}`;
  return app(req, res);
}
