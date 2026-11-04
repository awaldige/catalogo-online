const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
}, {
  collection: 'usuarios',
  versionKey: '__v'
});

const User = mongoose.model('User', userSchema, 'usuarios');

module.exports = User;