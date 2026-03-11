import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const data = req.body;
      if (!data?.name || !data?.topic) return res.status(400).json({ error: 'Missing required fields' });
      const key = `topics/${Date.now()}_${sanitize(data.name)}.json`;
      await put(key, JSON.stringify({ ...data, submittedAt: new Date().toISOString() }), {
        access: 'public', contentType: 'application/json', token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'topics/', token: process.env.BLOB_READ_WRITE_TOKEN });
      const records = await Promise.all(blobs.map(b =>
        fetch(b.downloadUrl || b.url, b.downloadUrl ? { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } } : {})
          .then(r => r.ok ? r.json() : null).catch(() => null)
      ));
      return res.status(200).json(records.filter(Boolean));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

function sanitize(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g,'_').slice(0,40); }
