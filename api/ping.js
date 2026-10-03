// GET /api/ping  is everything clone needs answering? (the house address, the records, the chain, the studio)
// ?studio=1 also makes one tiny test photo (rate-limited), to see which model answers.
const L = require('./_lib');
// ?face=0..3  the brand's example faces (fictional, adult, made with FLUX once and kept), for the banner and the roster's
// empty state. Fixed prompts only, so nothing arbitrary can be generated here.
const SHOTS = [   // [face file, prompt]: "you" and "your clone", the same face
  ['ivy', 'A new photo of this exact same woman: sitting at a cluttered desk late at night in a small dim bedroom, tired, lit only by a laptop screen, old grey t-shirt, messy bun. Candid phone photo. Keep her face, freckles and copper hair exactly the same.'],
  ['ivy', 'A new photo of this exact same woman: stepping down the stairs of a private jet on a sunny runway, oversized sunglasses, white linen suit, wind in her copper hair, golden hour, paparazzi photo. Keep her face and freckles exactly the same.'],
  ['theo', 'A new photo of this exact same man: squeezed into a crowded subway car on a rainy grey morning, grey hoodie, earbuds, bored. Candid phone photo. Keep his face and bleached buzzcut exactly the same.'],
  ['theo', 'A new photo of this exact same man: driving a white convertible sports car along a sunny Mediterranean coast road at sunset, sunglasses, open linen shirt, grinning. Paparazzi photo. Keep his face and bleached buzzcut exactly the same.'],
];
module.exports = async (req, res) => {
  L.setOidc(req);
  const sq = L.query(req).shot;
  if (sq != null && /^[0-3]$/.test(String(sq)) && L.dbReady()) {
    try {
      await L.ready(); const n = Number(sq);
      let r = (await L.q('SELECT img FROM k0_brand WHERE n=$1', [n]))[0];
      if (!r && !L.limited('shot', 8, 3600000)) {
        const fr = await fetch(L.origin(req) + '/assets/img/faces/' + SHOTS[n][0] + '.jpg', { signal: AbortSignal.timeout(10000) });
        const ref = Buffer.from(await fr.arrayBuffer()).toString('base64');
        const p = await L.photo(SHOTS[n][1], ref, 55000);
        if (p.ok) { const img = await require('sharp')(p.buf).resize(900, 1125, { fit: 'cover', position: 'attention' }).jpeg({ quality: 90 }).toBuffer(); await L.q('INSERT INTO k0_brand (n, img) VALUES ($1,$2) ON CONFLICT (n) DO UPDATE SET img=EXCLUDED.img, at=now()', [n, img]); r = { img }; }
        else return L.send(res, 200, { ok: false, error: p.error });
      }
      if (!r) return L.send(res, 200, { ok: false, error: 'not made yet' });
      res.statusCode = 200; res.setHeader('Content-Type', 'image/jpeg'); res.setHeader('Cache-Control', 'public, max-age=3600'); return res.end(Buffer.from(r.img));
    } catch (e) { return L.send(res, 200, { ok: false, error: String(e && e.message).slice(0, 200) }); }
  }
  const out = { ok: true, open: !!L.STUDIO, studio: L.STUDIO || null, records: L.dbReady(), captions: L.MODEL, photos: L.IMG_EDIT, gateway: !!L.gatewayToken() };
  try { await L.rpc('getSlot', []); out.chain = true; } catch { out.chain = false; }
  if (out.records) { try { await L.ready(); out.records = true; const s = (await L.q('SELECT shots, shots_day FROM k0_state WHERE id=1'))[0]; out.shotsToday = s && s.shots_day && new Date(s.shots_day).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) ? s.shots : 0; out.dailyShots = L.DAILY_SHOTS; } catch { out.records = false; } }
  if (L.query(req).studio === '1' && !L.limited('pingstudio', 4, 3600000)) {
    const t = await L.ai([{ role: 'user', content: 'Say only: ok' }], 16); out.caption = t.ok ? 'ok' : t.error;
    const ref = L.query(req).ref === '1' ? (await require('sharp')({ create: { width: 256, height: 256, channels: 3, background: '#e9b' } }).jpeg().toBuffer()).toString('base64') : null;
    const p = await L.photo('a small red ceramic mug on a wooden table, soft morning light', ref, 45000); out.photo = p.ok ? { model: p.model, ref: p.ref, bytes: p.buf.length } : p.error;
  }
  L.send(res, 200, out);
};
