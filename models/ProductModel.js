const db = require('../config/db');

class ProductModel {
    // --- CATEGORIAS ---

    /**
     * Obtiene todas las categorías de un restaurante.
     * @param {number} restaurantId
     * @returns {Promise<Array>} Un array de categorías.
     */
    static async getCategoriesByRestaurant(restaurantId) {
        try {
            const [rows] = await db.execute('SELECT * FROM categorias WHERE id_restaurante = ?', [restaurantId]);
            return rows;
        } catch (error) {
            console.error('Error en getCategoriesByRestaurant:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva categoría para un restaurante.
     * @param {string} name
     * @param {number} restaurantId
     * @returns {Promise<number>} El ID de la nueva categoría.
     */
    static async createCategory(name, restaurantId) {
        try {
            const [result] = await db.execute('INSERT INTO categorias (nombre, id_restaurante) VALUES (?, ?)', [name, restaurantId]);
            return result.insertId;
        } catch (error) {
            console.error('Error en createCategory:', error);
            throw error;
        }
    }

    /**
     * Elimina una categoría y todos sus productos asociados para mantener la integridad de los datos.
     * @param {number} id
     * @returns {Promise<boolean>} True si se eliminó, false si no se encontró.
     */
    static async deleteCategory(id) {
        try {
            // Primero, elimina todos los productos de esta categoría.
            await db.execute('DELETE FROM productos WHERE id_categoria = ?', [id]);
            // Luego, elimina la categoría.
            const [result] = await db.execute('DELETE FROM categorias WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en deleteCategory:', error);
            throw error;
        }
    }

    // --- PRODUCTOS ---

    /**
     * Obtiene todos los productos de una categoría específica.
     * @param {number} categoryId
     * @returns {Promise<Array>} Un array de productos.
     */
    static async getProductsByCategory(categoryId) {
        try {
            const [rows] = await db.execute('SELECT * FROM productos WHERE id_categoria = ?', [categoryId]);
            return rows;
        } catch (error) {
            console.error('Error en getProductsByCategory:', error);
            throw error;
        }
    }

    /**
     * Obtiene un producto por su ID, incluyendo el ID del restaurante.
     * @param {number} id
     * @returns {Promise<Object>} El objeto del producto o null si no se encuentra.
     */
    static async getProductById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT p.*, c.id_restaurante
                FROM productos p
                JOIN categorias c ON p.id_categoria = c.id
                WHERE p.id = ?
            `, [id]);
            // Devuelve el primer resultado o null si no se encuentra.
            return rows[0] || null;
        } catch (error) {
            console.error('Error en getProductById:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo producto.
     * @param {string} name
     * @param {string} description
     * @param {number} price
     * @param {string} image
     * @param {number} categoryId
     * @returns {Promise<number>} El ID del nuevo producto.
     */
    static async createProduct(name, description, price, image, categoryId) {
        try {
            const [result] = await db.execute(
                'INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria) VALUES (?, ?, ?, ?, ?)',
                [name, description, price, image, categoryId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error en createProduct:', error);
            throw error;
        }
    }

    /**
     * Actualiza los campos de un producto de forma dinámica.
     * @param {number} id
     * @param {Object} data Un objeto con los campos a actualizar.
     * @returns {Promise<boolean>} True si se actualizó, false si no se encontró.
     */
    static async updateProduct(id, data) {
        try {
            const updates = [];
            const params = [];

            if (data.name !== undefined) { updates.push('nombre = ?'); params.push(data.name); }
            if (data.description !== undefined) { updates.push('descripcion = ?'); params.push(data.description); }
            if (data.price !== undefined) { updates.push('precio = ?'); params.push(data.price); }
            if (data.image !== undefined) { updates.push('imagen = ?'); params.push(data.image); }
            if (data.categoryId !== undefined) { updates.push('id_categoria = ?'); params.push(data.categoryId); }

            if (updates.length === 0) {
                return false;
            }

            const query = `UPDATE productos SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id);

            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en updateProduct:', error);
            throw error;
        }
    }

    /**
     * Elimina un producto por su ID.
     * @param {number} id
     * @returns {Promise<boolean>} True si se eliminó, false si no se encontró.
     */
    static async deleteProduct(id) {
        try {
            const [result] = await db.execute('DELETE FROM productos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en deleteProduct:', error);
            throw error;
        }
    }
}

module.exports = ProductModel;