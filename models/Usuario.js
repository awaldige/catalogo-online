const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, default: "admin" } // pode ser 'admin' ou 'user'
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
