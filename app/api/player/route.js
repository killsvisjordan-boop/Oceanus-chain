// ================================================================
// FILE 5a — save as:  app/api/player/route.js
// ================================================================
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();
    if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

    await sql`
      INSERT INTO players (wallet) VALUES (${wallet})
      ON CONFLICT (wallet) DO UPDATE SET last_seen = NOW()
    `;

    const [lb] = await sql`
      SELECT total_points, games_played, rank FROM leaderboard WHERE wallet = ${wallet}
    `;

    const gamePts = await sql`
      SELECT game_slug, SUM(points) as pts FROM scores
      WHERE wallet = ${wallet} GROUP BY game_slug
    `;

    const byGame = {};
    gamePts.forEach(r => { byGame[r.game_slug] = parseInt(r.pts); });

    const [player] = await sql`SELECT * FROM players WHERE wallet = ${wallet}`;

    return NextResponse.json({
      player: {
        ...player,
        total_points:  parseInt(lb?.total_points  || 0),
        games_played:  parseInt(lb?.games_played  || 0),
        rank:          lb?.rank ? parseInt(lb.rank) : null,
        snake:  byGame.snake  || 0,
        flappy: byGame.flappy || 0,
        memory: byGame.memory || 0,
        chess:  byGame.chess  || 0,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { wallet, username } = await request.json();
    if (!wallet || !username) return NextResponse.json({ error: 'wallet and username required' }, { status: 400 });

    const clean = username.trim().slice(0, 32);
    const taken = await sql`SELECT wallet FROM players WHERE username = ${clean} AND wallet != ${wallet.toLowerCase()}`;
    if (taken.length) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });

    const [player] = await sql`
      INSERT INTO players (wallet, username) VALUES (${wallet.toLowerCase()}, ${clean})
      ON CONFLICT (wallet) DO UPDATE SET username = ${clean}, last_seen = NOW()
      RETURNING *
    `;
    return NextResponse.json({ success: true, player });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

