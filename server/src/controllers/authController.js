const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_nodevault_dev';

// 1. REGISTRO DE USUÁRIO
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Utiliza o campo 'password' do schema.prisma
      },
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}

// 2. LOGIN DE USUÁRIO
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }

    // Compara a senha informada com o campo 'password' gravado no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro ao realizar login.' });
  }
}

module.exports = {
  register,
  login,
};