const express = require('express');
const { processCheckout, getMyPurchases } = require('../controllers/purchaseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Ambas as rotas exigem autenticação
router.post('/checkout', authMiddleware, processCheckout);
router.get('/my-purchases', authMiddleware, getMyPurchases);

module.exports = router;