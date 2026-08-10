const express = require('express');
const {
  listCategories,
  listAssets,
  getAssetById,
  createAsset,
  downloadAsset,
} = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

// Rotas públicas (A rota /categories DEVE vir antes de /:id)
router.get('/categories', listCategories);
router.get('/', listAssets);
router.get('/:id', getAssetById);
router.get('/:id/download', downloadAsset);

// Rota protegida (Upload)
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'assetFile', maxCount: 1 },
  ]),
  createAsset
);

module.exports = router;