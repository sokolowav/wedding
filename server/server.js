const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const initRecords = require('./createRecords')

const app = express()

app.set('port', 8080)

mongoose
  .connect('mongodb://localhost:27017/guests')
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
