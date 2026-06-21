export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    guest_name, guest_phone, rsvp_status, headcount,
    rooting_for, excited_level, fav_event, events_attending, wishes
  } = req.body;

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
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Harithanayam RSVP <onboarding@resend.dev>',
        to:   ['hari.bollineni1999@gmail.com'],
        subject: `💌 RSVP from ${guest_name || 'a guest'} — #Harithanayam`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
