// /api/submit-recognition.js
// Sends recognition submission to elizabeth@tigertracks.ai via Resend

import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fromName, toName, message } = req.body || {};
  if (!fromName || !toName || !message) return res.status(400).json({ error: 'Missing required fields: fromName, toName, message' });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Tiger Tracks Retreat <checkins@tigertracks.ai>';
  const to = 'elizabeth@tigertracks.ai';
  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1e293b;">
      <div style="background:#f59e0b;padding:16px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;color:#fff;font-size:18px;">🏅 New Recognition Submission</h2>
        <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px;">Tiger Tracks Miami Summit 2026 — Recognition Ceremony</p>
      </div>
      <div style="background:#fffbeb;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #fde68a;border-top:none;">
        <p style="font-size:13px;margin:0 0 12px;color:#92400e;font-weight:600;">FOR YOUR CEREMONY NOTES</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-weight:600;width:120px;">From</td><td>${fromName}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Recognizing</td><td><strong>${toName}</strong></td></tr>
        </table>
        <div style="background:#fff;border:1px solid #fde68a;border-radius:6px;padding:14px;margin-top:12px;">
          <p style="margin:0;font-size:14px;line-height:1.6;">"${message}"</p>
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Submitted ${submittedAt} ET</p>
      </div>
    </div>`;

  if (!apiKey) {
    console.log('RECOGNITION SUBMISSION:', JSON.stringify({ fromName, toName, message, submittedAt }));
    return res.status(200).json({ ok: true, note: 'logged (no RESEND_API_KEY)' });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to: [to], subject: `[Miami Summit] Recognition: ${fromName} → ${toName}`, html });
    if (error) return res.status(500).json({ error: error.message || 'Send failed' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
