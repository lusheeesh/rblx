export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    var response = await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    return res.status(response.ok ? 200 : 500).end();
  } catch (e) {
    return res.status(500).end();
  }
}
