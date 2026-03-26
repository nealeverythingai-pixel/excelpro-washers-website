'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function assignContractor(jobId: string, contractorId: string, contractorName: string) {
  await db.jobs.update(jobId, {
    assignedContractorId: contractorId,
    assignedContractorName: contractorName,
    assignedAt: new Date().toISOString(),
    availableToContractors: true,
  })
  revalidatePath('/admin/dashboard/schedule')
}

export async function unassignContractor(jobId: string) {
  await db.jobs.update(jobId, {
    assignedContractorId: undefined,
    assignedContractorName: undefined,
    assignedAt: undefined,
    availableToContractors: false,
  })
  revalidatePath('/admin/dashboard/schedule')
}

export async function getContractorsWithAvailability(date: string) {
  const users = await db.users.getAll()
  const contractors = users.filter(u => u.role === 'CONTRACTOR' && u.active)

  // day_of_week: 0=Sun … 6=Sat — parse the date as local date
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()

  const [allAvailability, blockedOnDate] = await Promise.all([
    db.contractorAvailability.getAll(),
    db.contractorBlocks.getByDate(date),
  ])

  return contractors.map(c => {
    const slot = allAvailability.find(a => a.contractorId === c.id && a.dayOfWeek === dayOfWeek)
    const isBlocked = blockedOnDate.some(b => b.contractorId === c.id)
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      skills: c.skills || [],
      isAvailable: !!slot && !isBlocked,
      hours: slot ? `${slot.startTime}–${slot.endTime}` : null,
      isBlocked,
      noScheduleSet: !slot,
    }
  })
}
