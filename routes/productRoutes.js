const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, getProducts, createProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');

// Rutas de PRODUCTOS
// La ruta para obtener un producto por ID DEBE ir primero para evitar conflictos.
router.get('/:productId', getProductById);
// Rutas generales de productos
router.post('/', createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

// Rutas de CATEGORIAS
// Esta ruta es específica para obtener productos de una categoría.
router.get('/categoria/:categoryId', getProducts);
// Rutas de gestión de categorías
router.get('/categorias/:restaurantId', getCategories);
router.post('/categorias', createCategory);
router.delete('/categorias/:id', deleteCategory);

module.exports = router;