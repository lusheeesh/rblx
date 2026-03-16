import { signToken } from '../_lib/auth.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'No password provided' });

  // timing-safe compare so brute force timing attacks don't work
  const provided = Buffer.from(password);
  const expected = Buffer.from(process.env.ADMIN_PASSWORD);

  let valid = false;
  try {
    valid = provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);
  } catch { valid = false; }

  if (!valid) {
    // small delay to slow down brute force
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Wrong password' });
  }

  const token = signToken({
    admin: true,
    exp:   Date.now() + 24 * 60 * 60 * 1000, // 24h
  });

  res.setHeader(
    'Set-Cookie',
    `sv_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  );
  res.json({ ok: true });
}
