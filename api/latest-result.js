export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.jolpi.ca/ergast/f1/current/last/results.json"
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "F1 results server error"
      });
    }

    const data = await response.json();

    const race =
      data?.MRData?.RaceTable?.Races?.[0] || null;

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json({
      source: "Jolpica F1",
      updatedAt: new Date().toISOString(),
      race
    });

  } catch (error) {
    return res.status(502).json({
      error: "Unable to reach F1 results server"
    });
  }
}
