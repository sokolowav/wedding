const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const initRecords = require('./createRecords')

require('dotenv').config()

const app = express()
const port = Number(process.env.PORT) || 443
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/guests'

app.set('port', port)

mongoose
  .connect(mongoUri)
  .then((db) => console.log('База данных подключена OK'))
  .catch((err) => console.error(err))

app.use('/', express.static(path.join(__dirname, '/public/')))
app.use('/list', express.static(path.join(__dirname, '/public/')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/records', require('./api/Records'))

initRecords()

app.listen(app.get('port'), () => {
  console.log(`Сервер запущен на порте:${app.get('port')}`)
})
