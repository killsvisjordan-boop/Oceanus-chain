// ================================================================
// FILE 5c — save as:  app/api/leaderboard/route.js
// ================================================================
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const game  = searchParams.get('game') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const rows = game === 'all'
      ? await sql`
          SELECT wallet, username, total_points, games_played, last_active, rank
          FROM leaderboard WHERE total_points > 0
          ORDER BY rank ASC LIMIT ${limit}
        `
      : await sql`
          SELECT wallet, username, total_points, games_played, rank
          FROM leaderboard_by_game
          WHERE game_slug = ${game} AND total_points > 0
          ORDER BY rank ASC LIMIT ${limit}
        `;

    const leaderboard = rows.map(r => ({
      ...r,
      wallet:       r.wallet ? r.wallet.slice(0,6) + '...' + r.wallet.slice(-4) : '???',
      total_points: parseInt(r.total_points || 0),
      games_played: parseInt(r.games_played || 0),
      rank:         parseInt(r.rank || 999),
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
