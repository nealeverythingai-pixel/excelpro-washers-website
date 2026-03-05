import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/admin/seed-sales-user
// One-time use to create sales users
export async function POST(request: Request) {
  // Protect with admin password
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
