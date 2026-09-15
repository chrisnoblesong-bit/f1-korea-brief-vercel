export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.jolpi.ca/ergast/f1/current/driverstandings.json"
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "F1 standings server error"
      });
    }

    const data = await response.json();

    const standings =
      data?.MRData?.StandingsTable?.StandingsLists?.[0]
        ?.DriverStandings || [];

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json({
      source: "Jolpica F1",
      updatedAt: new Date().toISOString(),
      data: standings
    });

  } catch (error) {
    return res.status(502).json({
      error: "Unable to reach F1 standings server"
    });
  }
}
