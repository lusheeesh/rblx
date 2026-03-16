import { verifyAdmin } from './_lib/auth.js';
import { ghGet, ghPut } from './_lib/github.js';

const FILE = 'svfeedback.json';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { content } = await ghGet(FILE);
      return res.json(JSON.parse(content));
    } catch { return res.json([]); }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const { content, sha } = await ghGet(FILE);
      const filtered = JSON.parse(content).filter(f => f.id !== id);
      await ghPut(FILE, JSON.stringify(filtered, null, 2), sha, `delete feedback: ${id}`);
      return res.json({ ok: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    try {
      const { content, sha } = await ghGet(FILE);
      const items = JSON.parse(content).map(f =>
        f.id === id ? { ...f, read: true } : f
      );
      await ghPut(FILE, JSON.stringify(items, null, 2), sha, `mark read: ${id}`);
      return res.json({ ok: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  res.status(405).end();
}
