require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o processo de seed...');

  // 1. Criar Categorias Iniciais
  // O 'upsert' cria o registro se ele não existir, ou ignora se já existir (pelo slug)
  const categoria3D = await prisma.category.upsert({
    where: { slug: 'modelos-3d' },
    update: {},
    create: {
      name: 'Modelos 3D',
      slug: 'modelos-3d',
    },
  });

  const categoriaSTL = await prisma.category.upsert({
    where: { slug: 'arquivos-stl' },
    update: {},
    create: {
      name: 'Arquivos STL',
      slug: 'arquivos-stl',
    },
  });

  const categoriaTexturas = await prisma.category.upsert({
    where: { slug: 'texturas-pbr' },
    update: {},
    create: {
      name: 'Texturas PBR',
      slug: 'texturas-pbr',
    },
  });

  console.log('✅ Categorias criadas com sucesso!');

  // 2. Criptografar a Senha do Usuário de Teste
  // Nunca salvamos senhas em texto puro no banco de dados!
  const passwordHash = await bcrypt.hash('123456', 10);

  // 3. Criar Usuário Admin / Teste
  const usuarioAdmin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      name: 'Admin Storefront',
      email: 'admin@store.com',
      passwordHash: passwordHash,
      role: 'admin',
    },
  });

  console.log(`✅ Usuário padrão criado: ${usuarioAdmin.email}`);
  console.log('🎉 Seed finalizado com sucesso!');
}

// Executa a função e gerencia a desconexão com o banco
main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });