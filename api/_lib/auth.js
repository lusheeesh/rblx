import crypto from 'crypto';

export function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = crypto.createHmac('sha256', process.env.JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(data).digest('base64url');
    // timing-safe compare to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export function verifyAdmin(req) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/sv_admin=([^;]+)/);
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}
