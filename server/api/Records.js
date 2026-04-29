const express = require('express')
const router = express.Router()
const Record = require('../models/Record')
const { v4: uuidv4 } = require('uuid')

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const formatBoolean = (value) => {
  if (value === true) return 'Да'
  if (value === false) return 'Нет'
  return 'Не указано'
}

const formatPresenceStatus = (presence, gender) => {
  if (presence === false) return '❌ Не получится :('
  if (presence === true) return gender === 'they' ? '✅ Мы будем!' : '✅ Я буду!'
  return 'Не указано'
}

const formatTimeAnswered = (value) => {
  if (!value) return 'Время не указано'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Время не указано' : date.toLocaleString('ru-RU')
}

const calculateGuestsStats = (records) => {
  const getGuestWeight = (record) => (record.gender === 'they' ? 2 : 1)

  const stats = records.reduce(
    (acc, record) => {
      const guestWeight = getGuestWeight(record)

      acc.guestsCount += guestWeight
      if (record.presence === true) acc.guestsCountWillBe += guestWeight
      if (record.presence === true && record.plusOne === true) acc.guestsCountWithPlusOne += 1
      if (record.presence === false) acc.guestsCountWillNotBe += guestWeight
      if (record.hasAnswered !== true) acc.guestsCountNotAnswered += guestWeight

      return acc
    },
    {
      guestsCount: 0,
      guestsCountWillBe: 0,
      guestsCountWithPlusOne: 0,
      guestsCountWillNotBe: 0,
      guestsCountNotAnswered: 0,
    },
  )

  return stats
}

const buildGuestsStatsMessage = (stats) => `
_____________________________
🗒 Список 🖊
Приглашенных: ${stats.guestsCount}
Сможет: ${stats.guestsCountWillBe}
+1: ${stats.guestsCountWithPlusOne}
Не сможет: ${stats.guestsCountWillNotBe}
Ещё не известно: ${stats.guestsCountNotAnswered}
Количество подтвержденных гостей: ${stats.guestsCountWillBe + stats.guestsCountWithPlusOne}
`

const buildTelegramMessage = ({ name, alias, gender, presence, plusOne, comment, timeAnswered, statsMessage }) => `📣 ${name || 'Без имени'} ${alias || ''}
${formatPresenceStatus(presence, gender)}
${plusOne === true ? '➕ Будет +1\n' : ''}${comment && comment.trim() ? `💬 "${comment}"\n` : ''}
🕐 ${formatTimeAnswered(timeAnswered)}


${statsMessage}
`

const sendTelegramNotification = async (record) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  const allRecords = await Record.find()
  const guestsStats = calculateGuestsStats(allRecords)
  const statsMessage = buildGuestsStatsMessage(guestsStats)

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: buildTelegramMessage({
        ...record.toObject(),
        statsMessage,
      }),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Telegram API error: ${response.status} ${errorBody}`)
  }
}

router.get('/', async (req, res) => {
  res.json(await Record.find())
})

router.post('/', async (req, res) => {
  const payload = {
    ...req.body,
    uuid: uuidv4(),
    presence: null,
    comment: '',
    hasAnswered: false,
    timeAnswered: '',
  }

  const record = new Record(payload)
  await record.save()

  res.json({ state: 'success' })
})

router.get('/:uuid', async (req, res) => {
  res.json(await Record.findOne({ uuid: req.params.uuid }))
})

router.put('/:uuid', async (req, res) => {
  const payload = {
    ...req.body,
    plusOne: req.body.presence === true && req.body.plusOne === true,
    hasAnswered: true,
    timeAnswered: new Date(),
  }
  const user = await Record.findOneAndUpdate(
    {
      uuid: req.params.uuid,
    },
    payload,
    { new: true },
  )

  try {
    await sendTelegramNotification(user)
  } catch (error) {
    console.error('Failed to send Telegram notification:', error.message)
  }

  res.json(user)
})

router.delete('/:uuid', async (req, res) => {
  await Record.findOneAndDelete({
    uuid: req.params.uuid
  })

  res.json({ state: 'deleted' })
})

module.exports = router
