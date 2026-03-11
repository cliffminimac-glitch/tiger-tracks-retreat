// /api/submit-topic.js
// Sends topic submission to elizabeth@tigertracks.ai via Resend

import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, category, topic, why, day } = req.body || {};
  if (!name || !topic) return res.status(400).json({ error: 'Missing required fields: name, topic' });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Tiger Tracks Retreat <checkins@tigertracks.ai>';
  const to = 'elizabeth@tigertracks.ai';
  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1e293b;">
      <div style="background:#0d9488;padding:16px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;color:#fff;font-size:18px;">💬 New Open Space Topic Submission</h2>
        <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:13px;">Tiger Tracks Miami Summit 2026</p>
      </div>
      <div style="background:#f8fafc;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-weight:600;width:120px;">From</td><td>${name}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Category</td><td>${category || '—'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Topic</td><td><strong>${topic}</strong></td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Why it matters</td><td>${why || '—'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Best day</td><td>${day || 'No preference'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;color:#94a3b8;">Submitted</td><td style="color:#94a3b8;">${submittedAt} ET</td></tr>
        </table>
      </div>
    </div>`;

  if (!apiKey) {
    console.log('TOPIC SUBMISSION:', JSON.stringify({ name, category, topic, why, day, submittedAt }));
    return res.status(200).json({ ok: true, note: 'logged (no RESEND_API_KEY)' });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to: [to], subject: `[Miami Summit] Open Space Topic: "${topic}" — from ${name}`, html });
    if (error) return res.status(500).json({ error: error.message || 'Send failed' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
