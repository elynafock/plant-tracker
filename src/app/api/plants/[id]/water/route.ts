import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await db.query(
      'UPDATE plants SET last_watered = CURRENT_DATE WHERE id = $1',
      [id]
    );
    return NextResponse.json({ message: 'Plant watered' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to water plant' }, { status: 500 });
  }
}
  