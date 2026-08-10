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

// Rota protegida: Ativos do próprio usuário logado
router.get('/me', authMiddleware, getUserAssets);

// Rota de detalhes (Pública)
router.get('/:id', getAssetById);

// Rota de download (Protegida por Autenticação)
router.get('/:id/download', authMiddleware, downloadAsset); // <--- authMiddleware AQUI

// Rotas de criação e remoção (Protegidas)
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

module.exports = router;