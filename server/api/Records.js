const express = require('express')
const router = express.Router()
const Record = require('../models/Record')
const { v4: uuidv4 } = require('uuid')

const VK_MESSAGE_MAX_LEN = 4000
const VK_API_VERSION = process.env.VK_API_VERSION || '5.199'

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

const buildVkMessage = ({ name, alias, gender, presence, plusOne, comment, timeAnswered, statsMessage }) => `📣 ${name || 'Без имени'} ${alias || ''}
${formatPresenceStatus(presence, gender)}
${plusOne === true ? '➕ Будет +1\n' : ''}${comment && comment.trim() ? `💬 "${comment}"\n` : ''}
🕐 ${formatTimeAnswered(timeAnswered)}


${statsMessage}
`

let vkConfigWarned = false

const sendVkNotification = async (record) => {
  const token = process.env.VK_GROUP_TOKEN
  const peerId = process.env.VK_PEER_ID

  if (!token || !peerId) {
    if (!vkConfigWarned) {
      console.warn(
        'VK: задайте VK_GROUP_TOKEN и VK_PEER_ID в .env (уведомления отключены)',
      )
      vkConfigWarned = true
    }
    return
  }

  if (!record || typeof record.toObject !== 'function') {
    console.warn('VK: пропуск — запись гостя не найдена после обновления')
    return
  }

  const allRecords = await Record.find()
  const guestsStats = calculateGuestsStats(allRecords)
  const statsMessage = buildGuestsStatsMessage(guestsStats)

  let text = buildVkMessage({
    ...record.toObject(),
    statsMessage,
  })
  if (text.length > VK_MESSAGE_MAX_LEN) {
    text = `${text.slice(0, VK_MESSAGE_MAX_LEN - 20)}\n… (обрезано)`
  }

  const body = new URLSearchParams({
    peer_id: String(peerId),
    random_id: String(Date.now()),
    message: text,
    access_token: token,
    v: VK_API_VERSION,
  })

  const response = await fetch('https://api.vk.com/method/messages.send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`VK HTTP error: ${response.status} ${errorBody}`)
  }

  const result = await response.json()
  if (result.error) {
    throw new Error(
      `VK API error: ${result.error.error_code} ${result.error.error_msg}`,
    )
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
    await sendVkNotification(user)
  } catch (error) {
    console.error('Failed to send VK notification:', error.message)
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
