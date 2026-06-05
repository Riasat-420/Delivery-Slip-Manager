import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbGet, saveDb } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const db = await getDb();
  const user = dbGet(db, 'SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const token = await signToken({ id: user.id, username: user.username, role: user.role });
  const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  res.cookies.set('auth-token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
  return res;
}
