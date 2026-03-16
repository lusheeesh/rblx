import { verifyAdmin } from '../_lib/auth.js';

export default function handler(req, res) {
  const payload = verifyAdmin(req);
  if (!payload) return res.status(401).json({ ok: false });
  res.json({ ok: true });
}
