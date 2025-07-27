const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await Usuario.findOne({ email });
    if (!user) return res.status(401).json({ message: "Usuário não encontrado." });

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) return res.status(401).json({ message: "Senha inválida." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
