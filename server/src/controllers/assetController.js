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

// 3. BUSCAR DETALHES DE UM ATIVO POR ID
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

// 4. CADASTRAR UM NOVO ATIVO
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

    // Busca a categoria selecionada ou pega a primeira como fallback
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

// 5. BAIXAR O ARQUIVO DIGITAL DO ATIVO
async function downloadAsset(req, res) {
  try {
    const { id } = req.params;

    const asset = await prisma.digitalAsset.findUnique({
      where: { id },
    });

    if (!asset || !asset.filePath) {
      return res.status(404).json({ error: 'Arquivo do ativo não encontrado.' });
    }

    const fileName = `${asset.title.replace(/\s+/g, '_')}.${asset.fileFormat}`;
    return res.download(asset.filePath, fileName);
  } catch (error) {
    console.error('Erro ao realizar download:', error);
    return res.status(500).json({ error: 'Erro ao processar download do ativo.' });
  }
}

module.exports = {
  listCategories,
  listAssets,
  getAssetById,
  createAsset,
  downloadAsset,
};