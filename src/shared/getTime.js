import { format, isValid } from 'date-fns'

export const getTime = (date) => {
  if (date == null || date === '') return '—'
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (!isValid(d)) return '—'
    return format(d, 'dd.MM.yyyy HH:mm')
  } catch {
    return '—'
  }
}