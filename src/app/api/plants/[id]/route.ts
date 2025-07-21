import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.query('DELETE FROM plants WHERE id = $1', [params.id]);
    return NextResponse.json({ message: 'Plant deleted' });
  } catch (error) {
    console.error('Error deleting plant:', error);
    return NextResponse.json({ error: 'Failed to delete plant' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, species } = await req.json();

  try {
    await db.query(
      'UPDATE plants SET name = $1, species = $2 WHERE id = $3',
      [name, species || null, params.id]
    );
    return NextResponse.json({ message: 'Plant updated' });
  } catch (error) {
    console.error('Error updating plant:', error);
    return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 });
  }
}
