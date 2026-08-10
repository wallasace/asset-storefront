const prisma = require('../lib/prisma');

// 1. PROCESSAR CHECKOUT (Comprar um ou mais ativos do carrinho)
async function processCheckout(req, res) {
  try {
    const userId = req.user.id; // Usuário logado via authMiddleware
    const { items } = req.body; // Array com os objetos ou IDs dos ativos: [{ assetId: '...' }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Nenhum item informado para checkout.' });
    }

    // Extrai os IDs dos ativos
    const assetIds = items
      .map((item) => (typeof item === 'object' ? item.assetId || item.id : item))
      .filter(Boolean);

    if (assetIds.length === 0) {
      return res.status(400).json({ error: 'IDs dos ativos são inválidos.' });
    }

    // Busca os ativos solicitados no banco
    const assets = await prisma.digitalAsset.findMany({
      where: { id: { in: assetIds } },
    });

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Nenhum dos ativos foi encontrado.' });
    }

    // Verifica se o usuário já comprou algum desses ativos previamente
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        userId,
        assetId: { in: assetIds },
      },
    });

    const alreadyPurchasedIds = new Set(existingPurchases.map((p) => p.assetId));

    // Filtra apenas ativos que o usuário ainda NÃO comprou e dos quais NÃO é o criador
    const assetsToPurchase = assets.filter((asset) => {
      const isCreator = asset.userId === userId;
      const alreadyBought = alreadyPurchasedIds.has(asset.id);
      return !isCreator && !alreadyBought;
    });

    if (assetsToPurchase.length === 0) {
      return res.status(400).json({
        error: 'Você já possui todos esses ativos na sua biblioteca ou é o criador deles.',
      });
    }

    // Prepara a criação dos registros de compra em lote
    const purchasesData = assetsToPurchase.map((asset) => ({
      userId,
      assetId: asset.id,
      amountPaid: asset.price,
      status: 'COMPLETED',
    }));

    // Executa em uma transação atômica no Prisma
    const createdPurchases = await prisma.$transaction(
      purchasesData.map((data) => prisma.purchase.create({ data }))
    );

    return res.status(201).json({
      message: 'Compra realizada com sucesso!',
      purchasesCount: createdPurchases.length,
      purchases: createdPurchases,
    });
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    return res.status(500).json({ error: 'Erro ao processar checkout.' });
  }
}

// 2. BUSCAR COMPRAS DO USUÁRIO (Minha Biblioteca)
async function getMyPurchases(req, res) {
  try {
    const userId = req.user.id;

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        asset: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            creator: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(purchases);
  } catch (error) {
    console.error('Erro ao buscar biblioteca do usuário:', error);
    return res.status(500).json({ error: 'Erro ao carregar sua biblioteca.' });
  }
}

module.exports = {
  processCheckout,
  getMyPurchases,
};