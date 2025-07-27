const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Usuário fixo (simulação de banco de dados)
const USUARIO_PADRAO = {
  email: 'admin@admin.com',
  senha: '785143',
  tipo: 'admin'
};

// POST /api/login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === USUARIO_PADRAO.email && senha === USUARIO_PADRAO.senha) {
    const token = jwt.sign(
      { email, tipo: USUARIO_PADRAO.tipo },
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '1h' }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: { email, tipo: USUARIO_PADRAO.tipo }
    });
  }

  return res.status(401).json({ erro: 'Credenciais inválidas' });
});

module.exports = router;
