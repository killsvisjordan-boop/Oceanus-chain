// ================================================================
// FILE 5b — save as:  app/api/scores/route.js
// ================================================================
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const CAPS = { snake: 5000, flappy: 3000, memory: 500, chess: 200 };
const VALID = ['snake', 'flappy', 'memory', 'chess'];

export async function POST(request) {
  try {
    const { wallet, game_slug, points, metadata } = await request.json();
    if (!wallet)    return NextResponse.json({ error: 'wallet required' },    { status: 400 });
    if (!game_slug) return NextResponse.json({ error: 'game_slug required' }, { status: 400 });
    if (!VALID.includes(game_slug)) return NextResponse.json({ error: 'invalid game' }, { status: 400 });

    const safePts = Math.min(Math.max(parseInt(points) || 0, 1), CAPS[game_slug]);

    await sql`
      INSERT INTO players (wallet) VALUES (${wallet.toLowerCase()})
      ON CONFLICT (wallet) DO UPDATE SET last_seen = NOW()
    `;

    const [score] = await sql`
      INSERT INTO scores (wallet, game_slug, points, metadata)
      VALUES (${wallet.toLowerCase()}, ${game_slug}, ${safePts}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;

    const [lb] = await sql`
      SELECT total_points, rank FROM leaderboard WHERE wallet = ${wallet.toLowerCase()}
    `;

    return NextResponse.json({
      success:      true,
      score_id:     score.id,
      points_added: safePts,
      new_total:    parseInt(lb?.total_points || safePts),
      rank:         lb?.rank ? parseInt(lb.rank) : null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();
    const game   = searchParams.get('game');
    const limit  = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

    const scores = game
      ? await sql`SELECT * FROM scores WHERE wallet=${wallet} AND game_slug=${game} ORDER BY played_at DESC LIMIT ${limit}`
      : await sql`SELECT * FROM scores WHERE wallet=${wallet} ORDER BY played_at DESC LIMIT ${limit}`;

    return NextResponse.json({ scores });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

