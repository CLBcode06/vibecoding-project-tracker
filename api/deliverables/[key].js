import app from "../../server/app.js";

// Explicit route ensures Vercel forwards /api/deliverables/:key for PUT.
export default function handler(req, res) {
  const rawKey = req.query?.key;
  const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
  if (!key) return res.status(400).json({ error: "Deliverable key is required." });
  req.url = `/api/deliverables/${encodeURIComponent(String(key))}`;
  return app(req, res);
}
