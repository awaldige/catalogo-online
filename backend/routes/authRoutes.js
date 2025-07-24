const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Usuário admin hardcoded (pode salvar no banco ou em arquivo)
const adminUser = {
  username: 'admin',
  // senha: '785143' hashed:
  passwordHash: '$2a$10$4j1KzNKl1dPVeXe1RMWjEOKX1xBtJe61vYOQHhP0jXqZZjBjF7OZa' // hash bcrypt da senha '785143'
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== adminUser.username)
    return res.status(401).json({ message: 'Usuário inválido' });

  const validPass = await bcrypt.compare(password, adminUser.passwordHash);
  if (!validPass)
    return res.status(401).json({ message: 'Senha incorreta' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  res.json({ token });
});

module.exports = router;

