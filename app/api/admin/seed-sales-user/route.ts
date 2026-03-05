import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/admin/seed-sales-user?password=XXX&name=YYY&email=ZZZ&pin=1234
export async function GET(request: Request) {
  const url = new URL(request.url)
  const password = url.searchParams.get('password')
  const name = url.searchParams.get('name')
  const email = url.searchParams.get('email')
  const pin = url.searchParams.get('pin')

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!name || !email || !pin) {
    return NextResponse.json({ error: 'name, email, pin required' }, { status: 400 })
  }

  try {
    const user = await db.users.create({
      id: crypto.randomUUID(),
      name,
      email,
      pin,
      role: 'SALES',
      active: true,
    })
    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/seed-sales-user
export async function POST(request: Request) {
  const body = await request.json()
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.users.create({
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      pin: body.pin,
      role: 'SALES',
      active: true,
    })
    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
