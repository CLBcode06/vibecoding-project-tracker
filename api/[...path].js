// Vercel routes /api/* requests to this function. Depending on the function
// router, req.url can include or omit the /api prefix; normalise it for Express.
import app from "../server/app.js";

export default function handler(req, res) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }
  return app(req, res);
}
