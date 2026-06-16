// ================================================================
// FILE 5d — save as:  app/api/games/route.js
// ================================================================
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const ADMIN = '0x7e7a9d68c6f08ad6b7eaebbd2ba7133bc492b283';

export async function GET() {
  try {
    const games = await sql`SELECT * FROM games ORDER BY id ASC`;
    return NextResponse.json({ games });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.admin_wallet?.toLowerCase() !== ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (body.action === 'toggle') {
      const [game] = await sql`UPDATE games SET active = NOT active WHERE slug=${body.slug} RETURNING *`;
      return NextResponse.json({ success: true, game });
    }
    if (body.action === 'add') {
      const [game] = await sql`
        INSERT INTO games (slug, name, description, pts_per_unit)
        VALUES (${body.slug}, ${body.name}, ${body.description}, ${body.pts_per_unit||10})
        ON CONFLICT (slug) DO UPDATE SET name=${body.name}, description=${body.description}, pts_per_unit=${body.pts_per_unit||10}
        RETURNING *
      `;
      return NextResponse.json({ success: true, game });
    }
    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
