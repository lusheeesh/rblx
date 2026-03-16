export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    var body    = req.body;
    if (!body || !body.payload) return res.status(400).end();

    var webhook = body.suggestions
      ? process.env.DISCORD_SUGGESTIONS_WEBHOOK
      : body.stats
        ? process.env.DISCORD_STATS_WEBHOOK
        : process.env.DISCORD_WEBHOOK;

    if (!webhook) return res.status(204).end();

    var response = await fetch(webhook, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body.payload),
    });

    return res.status(response.ok ? 200 : 502).end();
  } catch (e) {
    console.error('[notify]', e.message);
    return res.status(500).end();
  }
}
