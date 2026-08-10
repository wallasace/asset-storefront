const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// Segredo para assinar o Token JWT (em produção fica no arquivo .env)
const JWT_SECRET = process.env.JWT_SECRET || 'secreta_super_segura_dev';

// 1. REGISTRO DE USUÁRIO
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validação básica de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // Verifica se o e-mail já está cadastrado
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // Criptografa a senha antes de salvar
    const passwordHash = await bcrypt.hash(password, 10);

    // Salva o novo usuário no banco
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
}

// 2. LOGIN DE USUÁRIO
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    // Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Compara a senha enviada com o hash salvo no banco
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gera o Token JWT com validade de 1 dia
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

module.exports = {
  register,
  login,
};