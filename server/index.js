import app from "./app.js";

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () => console.log(`Citrus API running at http://localhost:${port}`));
