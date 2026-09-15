export default async function handler(req, res) {
  const path = (req.query.path || "standings").replace(/^\/+/, "");
  const allowed = new Set(["standings", "results"]);
  if (!allowed.has(path)) return res.status(400).json({ error: "Invalid path" });

  const url = `https://api.jolpi.ca/ergast/f1/2026/${path}.json`;
  try {
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) return res.status(r.status).json({ error: "Upstream F1 data error" });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: "Unable to reach F1 data server" });
  }
}
