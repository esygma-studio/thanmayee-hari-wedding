const nodemailer = require('nodemailer');

function headcountToNumber(text) {
  if (!text) return 0;
  if (text.includes('Just Me')) return 1;
  if (text.includes('+1'))      return 2;
  if (text.includes('+2'))      return 3;
  if (text.includes('+3'))      return 4;
  if (text.includes('+4'))      return 5;
  if (text.includes('+5'))      return 6;
  return 1;
}

async function readAndUpdateGuestCount(rsvpStatus, headcount) {
  const dbUrl = process.env.FIREBASE_DB_URL;
  if (!dbUrl || dbUrl.startsWith('YOUR_')) return null;

  try {
    const readRes     = await fetch(`${dbUrl}/guestCount.json`);
    const currentCount = (await readRes.json()) || 0;

    const isAccepting = rsvpStatus && rsvpStatus.toLowerCase().includes('accept');
    const newGuests   = isAccepting ? headcountToNumber(headcount) : 0;
    const newTotal    = currentCount + newGuests;

    if (newGuests > 0) {
      await fetch(`${dbUrl}/guestCount.json`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newTotal),
      });
    }

    return newTotal;
  } catch (e) {
    console.warn('Firebase counter error:', e);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    guest_name, guest_phone, rsvp_status, headcount,
    rooting_for, excited_level, fav_event, events_attending, wishes
  } = req.body;

  const totalGuests = await readAndUpdateGuestCount(rsvp_status, headcount);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const counterBlock = totalGuests !== null ? `
    <div style="background:#112018;border:1px solid rgba(196,184,112,0.4);border-radius:6px;
                padding:20px 24px;text-align:center;margin-bottom:24px;">
      <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:3px;
                  text-transform:uppercase;color:#a59b60;margin-bottom:6px;">
        Running Total — Confirmed Guests
      </div>
      <div style="font-family:Georgia,serif;font-size:42px;font-weight:bold;
                  color:#c4b870;line-height:1;letter-spacing:2px;">
        ${totalGuests}
      </div>
    </div>` : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f6f0; margin: 0; padding: 0; }
    .wrap { max-width: 580px; margin: 32px auto; background: #fff;
            border: 1px solid #e8e0d0; border-radius: 6px; overflow: hidden; }
    .header { background: #112018; padding: 32px 36px; text-align: center; }
    .header h1 { color: #c4b870; font-size: 22px; letter-spacing: 3px;
                 text-transform: uppercase; margin: 0 0 4px; }
    .header p  { color: #a59b60; font-size: 12px; letter-spacing: 2px; margin: 0; }
    .body { padding: 32px 36px; }
    .row { display: flex; border-bottom: 1px solid #f0ebe0; padding: 12px 0; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
             color: #888; width: 160px; flex-shrink: 0; padding-top: 2px; }
    .value { font-size: 15px; color: #2a3a2a; flex: 1; }
    .badge { display: inline-block; background: #112018; color: #c4b870;
             font-size: 11px; letter-spacing: 1px; padding: 3px 10px;
             border-radius: 3px; }
    .wishes-box { background: #f9f6f0; border-left: 3px solid #a59b60;
                  padding: 12px 16px; border-radius: 0 4px 4px 0;
                  font-style: italic; color: #3d4a3a; margin-top: 4px; }
    .footer { background: #f9f6f0; padding: 20px 36px; text-align: center;
              font-size: 11px; color: #999; letter-spacing: 1px; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>#Harithanayam</h1>
    <p>NEW RSVP · 31 OCTOBER 2026</p>
  </div>
  <div class="body">
    ${counterBlock}
    <div class="row">
      <span class="label">Guest</span>
      <span class="value"><strong>${guest_name || '—'}</strong></span>
    </div>
    <div class="row">
      <span class="label">Phone</span>
      <span class="value">${guest_phone || '—'}</span>
    </div>
    <div class="row">
      <span class="label">RSVP</span>
      <span class="value"><span class="badge">${rsvp_status || '—'}</span></span>
    </div>
    <div class="row">
      <span class="label">Party size</span>
      <span class="value">${headcount || '—'}</span>
    </div>
    <div class="row">
      <span class="label">Rooting for</span>
      <span class="value">${rooting_for || '—'}</span>
    </div>
    <div class="row">
      <span class="label">Excitement</span>
      <span class="value">${excited_level || '—'}</span>
    </div>
    <div class="row">
      <span class="label">Fav event</span>
      <span class="value">${fav_event || '—'}</span>
    </div>
    <div class="row">
      <span class="label">Attending</span>
      <span class="value">${events_attending || '—'}</span>
    </div>
    <div class="row" style="flex-direction:column; gap:8px;">
      <span class="label">Wishes</span>
      <div class="wishes-box">${wishes || '—'}</div>
    </div>
  </div>
  <div class="footer">Thanmayee &amp; Hari · #Harithanayam · 31 October 2026</div>
</div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from:    `"Harithanayam RSVP" <${process.env.GMAIL_USER}>`,
      to:      'hari.bollineni1999@gmail.com',
      subject: `💌 RSVP from ${guest_name || 'a guest'} — #Harithanayam`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Gmail SMTP error:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
