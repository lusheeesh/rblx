import crypto from 'crypto';
import { ghGet, ghPut } from './_lib/github.js';

async function storeFeedback(payload) {
  try {
    const embed  = payload?.embeds?.[0] || {};
    const fields = embed.fields || [];
    const uid    = fields.find(f => f.name === 'User')?.value?.replace(/`/g, '') || 'unknown';
    const device = fields.find(f => f.name === 'Device')?.value || 'unknown';

    const entry = {
      id:      crypto.randomUUID(),
      title:   embed.title || 'Feedback',
      message: embed.description || '',
      uid,
      device,
      date: new Date().toISOString(),
      read: false,
    };

    let items = [], sha;
    try {
      const r = await ghGet('svfeedback.json');
      items = JSON.parse(r.content);
      sha   = r.sha;
    } catch {}

    items.unshift(entry);
    if (items.length > 300) items = items.slice(0, 300);
    await ghPut('svfeedback.json', JSON.stringify(items, null, 2), sha, 'store feedback');
  } catch (err) {
    console.error('storeFeedback error:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    var body    = req.body;
    var webhook = body.suggestions
      ? process.env.DISCORD_SUGGESTIONS_WEBHOOK
      : body.stats
        ? process.env.DISCORD_STATS_WEBHOOK
        : process.env.DISCORD_WEBHOOK; // ← kept your original var name

    const jobs = [];

    if (webhook) {
      jobs.push(fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body.payload),
      }).catch(() => {}));
    }

    // only store to GitHub if it's a suggestion/feedback (not stats pings)
    if (body.suggestions && body.payload) {
      jobs.push(storeFeedback(body.payload));
    }

    await Promise.allSettled(jobs);
    return res.status(200).end();
  } catch (e) {
    return res.status(500).end();
  }
}
