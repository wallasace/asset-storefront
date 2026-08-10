const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o processo de seed...');

  // 1. Criar Categorias Iniciais
  await prisma.category.upsert({
    where: { slug: 'modelos-3d' },
    update: {},
    create: {
      name: 'Modelos 3D',
      slug: 'modelos-3d',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'texturas-pbr' },
    update: {},
    create: {
      name: 'Texturas PBR',
      slug: 'texturas-pbr',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'shaders-vfx' },
    update: {},
    create: {
      name: 'Shaders & VFX',
      slug: 'shaders-vfx',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'scripts-ferramentas' },
    update: {},
    create: {
      name: 'Scripts & Ferramentas',
      slug: 'scripts-ferramentas',
    },
  });

  console.log('✅ Categorias criadas com sucesso!');

  // 2. Hash da Senha Padrão (123456)
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 3. Criar Usuário Admin / Teste
  const usuarioAdmin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      name: 'Admin Storefront',
      email: 'admin@store.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Usuário Administrador criado com sucesso:', usuarioAdmin.email);
  console.log('🌱 Processo de seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });