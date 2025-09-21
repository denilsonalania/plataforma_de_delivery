const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, getProducts, createProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');

// The most specific routes should come first.

// Route for deleting a product by ID.
router.delete('/:id', deleteProduct);

// Routes for CATEGORIES
router.get('/categorias/:restaurantId', getCategories);
router.post('/categorias', createCategory);
router.delete('/categorias/:id', deleteCategory);

// General routes for the product collection
router.get('/:categoryId', getProducts);
router.post('/', createProduct);

module.exports = router;

