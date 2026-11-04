const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'Informe o e-mail e a senha.'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado.');

      return res.status(500).json({
        message: 'Configuração de autenticação indisponível.'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: 'admin'
    });

    if (!user) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.senha
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos.'
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      admin: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no login:', error.message);

    return res.status(500).json({
      message: 'Erro interno ao realizar login.'
    });
  }
}

module.exports = { login };
