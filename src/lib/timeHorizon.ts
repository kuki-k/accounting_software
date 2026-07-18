import type { TimeHorizon } from '../types'

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function getTimeHorizon(
  dateValue: string | undefined,
  now = new Date(),
): TimeHorizon {
  if (!dateValue) return 'undated'
  const date = parseDateOnly(dateValue)
  if (!date) return 'undated'

  const startToday = startOfDay(now)
  const endThisMonth = endOfMonth(now)
  const endIn3Months = endOfMonth(addMonths(now, 2))

  if (date <= endThisMonth) return 'this_month'
  if (date <= endIn3Months) return 'within_3_months'
  if (date < startToday) return 'this_month'
  return 'later'
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

export function formatDisplayDate(value: string): string {
  const date = parseDateOnly(value)
  if (!date) return value
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

export function formatAmount(value: number): string {
  return `¥${value.toLocaleString('ja-JP')}`
}
