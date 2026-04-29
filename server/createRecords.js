const Record = require('./models/Record')
const { v4: uuidv4 } = require('uuid')

const testGuests = [
  {
    name: 'Мария',
    gender: 'she',
    presence: true,
  },
  {
    name: 'Владимир',
    gender: 'he',
    presence: true,
  },
]

const initRecords = async () => {
  const records = await Record.find()

  if (records.length > 0) {
    return
  }

  testGuests.forEach(async (guest) => {
    const payload = {
      ...guest,
      uuid: uuidv4(),
      hasAnswered: true,
      timeAnswered: '',
    }

    const record = new Record(payload)

    await record.save()
  })
}

module.exports = initRecords
