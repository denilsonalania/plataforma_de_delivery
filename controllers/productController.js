const ProductModel = require('../models/ProductModel');

module.exports = {
    // --- Funciones para CATEGORIAS ---
    getCategories: async (req, res) => {
        const { restaurantId } = req.params;
        try {
            const categories = await ProductModel.getCategoriesByRestaurant(restaurantId);
            res.json(categories || []);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({ error: 'Error al obtener categorías', details: error.message });
        }
    },

    createCategory: async (req, res) => {
        const { name, restaurantId } = req.body;
        if (!name || !restaurantId) {
            return res.status(400).json({ error: 'Nombre de categoría e ID de restaurante son obligatorios' });
        }
        try {
            const newId = await ProductModel.createCategory(name, restaurantId);
            res.status(201).json({ id: newId, message: 'Categoría creada' });
        } catch (error) {
            console.error('Error al crear categoría:', error);
            res.status(500).json({ error: 'Error al crear categoría', details: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        const { id } = req.params;
        try {
            const deleted = await ProductModel.deleteCategory(id);
            if (deleted) {
                res.json({ message: 'Categoría eliminada' });
            } else {
                res.status(404).json({ error: 'Categoría no encontrada' });
            }
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({ error: 'Error al eliminar categoría', details: error.message });
        }
    },

    // --- Funciones para PRODUCTOS ---
    getProducts: async (req, res) => {
        const { categoryId } = req.params;
        try {
            const products = await ProductModel.getProductsByCategory(categoryId);
            res.json(products || []);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error al obtener productos', details: error.message });
        }
    },

    createProduct: async (req, res) => {
        const { name, description, price, image, categoryId } = req.body;
        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: 'Nombre, precio e ID de categoría son obligatorios' });
        }
        try {
            const newId = await ProductModel.createProduct(name, description, price, image, categoryId);
            res.status(201).json({ id: newId, message: 'Producto creado' });
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({ error: 'Error al crear producto', details: error.message });
        }
    },

    updateProduct: async (req, res) => {
        const { id } = req.params;
        const { name, description, price, image } = req.body;
        try {
            const updated = await ProductModel.updateProduct(id, name, description, price, image);
            if (updated) {
                res.json({ message: 'Producto actualizado' });
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const deleted = await ProductModel.deleteProduct(id);
            if (deleted) {
                res.json({ message: 'Producto eliminado' });
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ error: 'Error al eliminar producto', details: error.message });
        }
    },

    getProductById: async (req, res) => {
        const { id } = req.params;
        try {
            const product = await ProductModel.getProductById(id);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener producto por ID:', error);
            res.status(500).json({ error: 'Error al obtener producto', details: error.message });
        }
    }
};