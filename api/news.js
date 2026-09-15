export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://news.google.com/rss/search?q=Formula%201&hl=ko&gl=KR&ceid=KR:ko"
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "News server error"
      });
    }

    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 20)
      .map(match => {
        const item = match[1];

        const get = tag => {
          const found = item.match(
            new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
          );
          return found ? found[1] : "";
        };

        return {
          title: get("title"),
          link: get("link"),
          date: get("pubDate"),
          description: get("description")
        };
      });

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      source: "Google News",
      updatedAt: new Date().toISOString(),
      data: items
    });

  } catch (error) {
    return res.status(502).json({
      error: "Unable to reach news server"
    });
  }
}
