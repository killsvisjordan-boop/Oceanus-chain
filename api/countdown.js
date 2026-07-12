// /api/countdown.js
// Deployed as a Vercel Serverless Function at:  https://oceanuschain.xyz/api/countdown
//
// Returns a single, globally-shared "nextResetTimestamp" computed on the
// SERVER (never on the visitor's device). Every browser that calls this
// endpoint — anywhere in the world — gets back the exact same value at the
// exact same moment, so the countdown is perfectly synchronized with no
// database, no cookies, and no localStorage.
//
// How it works:
//   - EPOCH is a fixed anchor point in the past.
//   - CYCLE is 48 hours.
//   - We calculate how many full 48h cycles have elapsed since EPOCH using
//     the server's own clock (Date.now(), which is UTC-based and not tied
//     to any single visitor), then return the timestamp of the START of
//     the *next* cycle.
//   - Because this is pure math (no stored state), the "reset" happens
//     automatically and identically for every request the instant a cycle
//     boundary passes — nothing needs to be written or updated anywhere.

module.exports = (req, res) => {
  const CYCLE_MS = 48 * 60 * 60 * 1000; // 48 hours
  const EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0); // Jan 1, 2026 00:00:00 UTC — fixed anchor

  const now = Date.now();
  const elapsed = now - EPOCH_MS;
  const cyclesPassed = Math.floor(elapsed / CYCLE_MS);
  const nextResetTimestamp = EPOCH_MS + (cyclesPassed + 1) * CYCLE_MS;

  // Never let this response be cached by a CDN/browser — every call must
  // hit the function live so all clients stay in sync.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    nextResetTimestamp: nextResetTimestamp,
    serverTime: now
  });
};
