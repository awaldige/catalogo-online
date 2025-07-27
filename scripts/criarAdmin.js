require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const email = "awaldige@gmail.com";
    const senha = "@Awalddige785143";

    const existente = await Usuario.findOne({ email });
    if (existente) {
      console.log("⚠️  Usuário admin já existe.");
      process.exit(0);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoAdmin = new Usuario({
      nome: "Admin",
      email,
      senha: senhaHash,
      role: "admin"
    });

    await novoAdmin.save();
    console.log("✅ Usuário admin criado com sucesso!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Erro ao criar admin:", err);
    process.exit(1);
  });
