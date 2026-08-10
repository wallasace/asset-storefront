const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');

// 1. LISTAR TODAS AS CATEGORIAS
async function listCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
}

// 2. LISTAR TODOS OS ATIVOS (Catálogo Público)
async function listAssets(req, res) {
  try {
    const { category, search } = req.query;

    const where = {};

    if (category && category.trim() !== '') {
      where.category = { slug: category };
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const assets = await prisma.digitalAsset.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(assets);
  } catch (error) {
    console.error('Erro ao listar ativos:', error);
    return res.status(500).json({ error: 'Erro ao buscar catálogo de ativos.' });
  }
}

// 3. BUSCAR ATIVOS DO USUÁRIO LOGADO (Painel Meus Ativos)
async function getUserAssets(req, res) {
  try {
    const userId = req.user.id;

    const assets = await prisma.digitalAsset.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(assets);
  } catch (error) {
    console.error('Erro ao buscar ativos do usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar seus ativos.' });
  }
}

// 4. BUSCAR DETALHES DE UM ATIVO POR ID
async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    const asset = await prisma.digitalAsset.findUnique({
      where: { id },
      include: {
        category: true,
        creator: { select: { id: true, name: true } },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Ativo digital não encontrado.' });
    }

    return res.json(asset);
  } catch (error) {
    console.error('Erro ao buscar ativo:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar o ativo.' });
  }
}

// 5. CADASTRAR UM NOVO ATIVO
async function createAsset(req, res) {
  try {
    const { title, description, price, fileFormat, categoryId } = req.body;
    const userId = req.user.id;

    const files = req.files;
    if (!files || !files.thumbnail || !files.assetFile) {
      return res.status(400).json({
        error: 'É necessário enviar a imagem de capa (thumbnail) e o arquivo do ativo (assetFile).',
      });
    }

    const thumbnail = files.thumbnail[0];
    const assetFile = files.assetFile[0];

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Informe um preço válido.' });
    }

    let targetCategoryId = categoryId && categoryId.trim() !== '' ? categoryId : null;

    if (!targetCategoryId) {
      const defaultCategory = await prisma.category.findFirst();
      if (!defaultCategory) {
        return res.status(400).json({
          error: 'Nenhuma categoria cadastrada no banco de dados. Execute o seed.',
        });
      }
      targetCategoryId = defaultCategory.id;
    }

    const newAsset = await prisma.digitalAsset.create({
      data: {
        title,
        description: description || '',
        price: parsedPrice,
        fileFormat: fileFormat || assetFile.originalname.split('.').pop(),
        fileSizeBytes: assetFile.size,
        filePath: assetFile.path,
        thumbnailUrl: `/uploads/${thumbnail.filename}`,
        creator: {
          connect: { id: userId },
        },
        category: {
          connect: { id: targetCategoryId },
        },
      },
    });

    return res.status(201).json({
      message: 'Ativo cadastrado com sucesso!',
      asset: newAsset,
    });
  } catch (error) {
    console.error('Erro ao cadastrar ativo:', error);
    return res.status(500).json({
      error: 'Erro ao cadastrar ativo digital.',
      details: error.message,
    });
  }
}

// 6. DELETAR UM ATIVO (Requer Autenticação + Verificação de Autorização)
async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const asset = await prisma.digitalAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado.' });
    }

    // Regra de Autorização: Apenas o dono ou admin pode excluir
    if (asset.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Você não é o proprietário deste ativo.' });
    }

    await prisma.digitalAsset.delete({
      where: { id },
    });

    return res.json({ message: 'Ativo removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar ativo:', error);
    return res.status(500).json({ error: 'Erro ao remover ativo digital.' });
  }
}

// 7. BAIXAR O ARQUIVO DIGITAL DO ATIVO
async function downloadAsset(req, res) {
  try {
    // Trava de segurança: Garante que req.user existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const asset = await prisma.digitalAsset.findUnique({
      where: { id },
    });

    if (!asset || !asset.filePath) {
      return res.status(404).json({ error: 'Ativo ou caminho do arquivo não encontrado no banco.' });
    }

    const isCreator = asset.userId === userId;
    const isAdmin = req.user.role === 'admin';

    // Verifica se existe registro de compra
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_assetId: {
          userId,
          assetId: id,
        },
      },
    });

    const hasPurchased = !!purchase;

    if (!isCreator && !isAdmin && !hasPurchased) {
      return res.status(403).json({
        error: 'Você precisa adquirir este ativo para realizar o download.',
      });
    }

    // Resolve o caminho absoluto do arquivo no disco
    const absolutePath = path.isAbsolute(asset.filePath)
      ? asset.filePath
      : path.resolve(process.cwd(), asset.filePath);

    // Verifica se o arquivo existe fisicamente na pasta uploads
    if (!fs.existsSync(absolutePath)) {
      console.error(`[DOWNLOAD] Arquivo não existe no disco: ${absolutePath}`);
      return res.status(404).json({
        error: 'O arquivo físico não foi encontrado na pasta uploads do servidor.',
      });
    }

    const fileName = `${asset.title.replace(/\s+/g, '_')}.${asset.fileFormat}`;
    return res.download(absolutePath, fileName);
  } catch (error) {
    console.error('Erro ao realizar download:', error);
    return res.status(500).json({ error: 'Erro interno ao processar download do ativo.' });
  }
}

module.exports = {
  listCategories,
  listAssets,
  getUserAssets,
  getAssetById,
  createAsset,
  deleteAsset,
  downloadAsset,
};