const express = require('express');
const {
  listCategories,
  listAssets,
  getUserAssets,
  getAssetById,
  createAsset,
  deleteAsset,
  downloadAsset,
} = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

// Rotas públicas
router.get('/categories', listCategories);
router.get('/', listAssets);

// Rota protegida: Busca ativos pertencentes ao usuário logado
// IMPORTANTE: /me deve ser declarada ANTES de /:id para evitar conflito de roteamento
router.get('/me', authMiddleware, getUserAssets);

router.get('/:id', getAssetById);
router.get('/:id/download', downloadAsset);

// Rotas protegidas (Mutação de dados)
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'assetFile', maxCount: 1 },
  ]),
  createAsset
);

router.delete('/:id', authMiddleware, deleteAsset);
router.get('/:id/download', authMiddleware, downloadAsset);

module.exports = router;