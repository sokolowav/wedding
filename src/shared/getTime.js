export const getTime = (date) => {
  if (date == null || date === '') return '—'
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (Number.isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Asia/Irkutsk',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)
  } catch {
    return '—'
  }
}