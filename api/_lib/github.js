const OWNER = 'lusheeesh';
const REPO  = 'rblx';
const BASE  = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const HDR   = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
});

export async function ghGet(path) {
  const res  = await fetch(`${BASE}/${path}`, { headers: HDR() });
  if (!res.ok) throw new Error(`ghGet ${path}: ${res.status}`);
  const data = await res.json();
  return { content: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha };
}

export async function ghPut(path, content, sha, message) {
  const body = { message, content: Buffer.from(content, 'utf8').toString('base64') };
  if (sha) body.sha = sha;
  const res = await fetch(`${BASE}/${path}`, {
    method: 'PUT',
    headers: { ...HDR(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ghPut ${path}: ${res.status} — ${await res.text()}`);
  return res.json();
}
