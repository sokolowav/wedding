const mongoose = require('mongoose')
const { Schema } = mongoose

const Record = new Schema({
  uuid: String,
  name: String,
  alias: String,
  gender: String,
  presence: Boolean,
  plusOne: Boolean,
  comment: String,
  hasAnswered: Boolean,
  timeAnswered: String,
})

module.exports = mongoose.model('Record', Record)
