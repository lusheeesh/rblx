export default async function handler(req, res) {
  const response = await fetch(
    "https://api.github.com/repos/lusheeesh/rblx/contents/svnotifs.json",
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Cache-Control": "no-store",
      },
    }
  );
  if (!response.ok) {
    return res.status(502).json({ error: "GitHub fetch failed" });
  }
  const data = await response.json();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(data);
}
