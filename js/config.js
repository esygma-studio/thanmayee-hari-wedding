/* ================================================================
   WEDDING WEBSITE — API KEYS
   Fill in these four values after account setup (see README notes).
   ================================================================ */

// ── EmailJS ─────────────────────────────────────────────────────
// 1. Sign up at https://www.emailjs.com (free — 200 emails/month)
// 2. Add a Gmail service and connect hari.bollineni1999@gmail.com
// 3. Create an Email Template (use the variable names listed below)
// 4. Paste your keys here

const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // Account → API Keys
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // Email Services tab
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // Email Templates tab

/*
   EmailJS Template variables to use in your template:
     {{guest_name}}       Guest's name
     {{guest_phone}}      Phone number
     {{rsvp_status}}      Joyfully Accept / Regrettably Decline
     {{headcount}}        Just Me / +1 / +2 / +3 / +4 / +5 or more
     {{rooting_for}}      Team Bride / Team Groom / Can't Choose
     {{excited_level}}    Hell YESSSS / Already Dancing / Waiting for the Food
     {{fav_event}}        Favourite event selected
     {{events_attending}} Comma-separated list of events
     {{wishes}}           Guest's message / wishes
*/

// ── Firebase Realtime Database (guest counter) ───────────────────
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (e.g. "harithanayam-wedding")
// 3. Build → Realtime Database → Create Database → Start in test mode
// 4. Copy the database URL (looks like https://xxx-rtdb.firebaseio.com)

const FIREBASE_DB_URL = 'YOUR_FIREBASE_DB_URL';
// Example: 'https://harithanayam-wedding-default-rtdb.firebaseio.com'
