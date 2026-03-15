export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    var body = req.body;
    var webhook = body.stats
      ? process.env.DISCORD_STATS_WEBHOOK
      : process.env.DISCORD_WEBHOOK;

    var payload = body.payload;

    var response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.status(response.ok ? 200 : 500).end();
  } catch (e) {
    return res.status(500).end();
  }
}
