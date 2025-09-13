const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, getProducts, createProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');

// Rutas para CATEGORIAS
router.get('/categorias/:restaurantId', getCategories);
router.post('/categorias', createCategory);
router.delete('/categorias/:id', deleteCategory);

// Rutas para PRODUCTOS
router.get('/:categoryId', getProducts); // Ruta para obtener todos los productos de una categoría
router.post('/', createProduct);         // Ruta para crear un producto

router.get('/unico/:id', getProductById);      // Ruta para obtener un solo producto por ID
router.put('/unico/:id', updateProduct);       // Ruta para ACTUALIZAR un producto por ID
router.delete('/unico/:id', deleteProduct);    // Ruta para ELIMINAR un producto por ID

module.exports = router;