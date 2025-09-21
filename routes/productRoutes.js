const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, getProducts, createProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');

// ===== RUTAS DE CATEGORÍAS (DEBEN IR PRIMERO) =====
// Estas rutas son más específicas, por eso van al principio
router.get('/categorias/:restaurantId', getCategories);
router.post('/categorias', createCategory);
router.delete('/categorias/:id', deleteCategory);

// ===== RUTAS DE PRODUCTOS POR CATEGORÍA =====
router.get('/categoria/:categoryId', getProducts);

// ===== RUTAS DE PRODUCTOS INDIVIDUALES =====
// IMPORTANTE: Esta ruta va al final porque es más general
// y podría interceptar rutas más específicas
router.get('/:productId', getProductById);
router.post('/', createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

module.exports = router;