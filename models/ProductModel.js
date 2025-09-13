const db = require('../config/db');

class ProductModel {
    // --- CATEGORIAS ---
    static async getCategoriesByRestaurant(restaurantId) {
        const [rows] = await db.execute('SELECT * FROM categorias WHERE id_restaurante = ?', [restaurantId]);
        return rows;
    }

    static async createCategory(name, restaurantId) {
        const [result] = await db.execute('INSERT INTO categorias (nombre, id_restaurante) VALUES (?, ?)', [name, restaurantId]);
        return result.insertId;
    }

    static async deleteCategory(id) {
        const [result] = await db.execute('DELETE FROM categorias WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // --- PRODUCTOS ---
    static async getProductsByCategory(categoryId) {
        const [rows] = await db.execute('SELECT * FROM productos WHERE id_categoria = ?', [categoryId]);
        return rows;
    }

    static async getProductById(id) {
        const [rows] = await db.execute(`SELECT p.*, c.id_restaurante
             FROM productos p
             JOIN categorias c ON p.id_categoria = c.id
             WHERE p.id = ?`,
            [id]);
        return rows[0];
    }

    static async createProduct(name, description, price, image, categoryId) {
        const [result] = await db.execute(
            'INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, image, categoryId]
        );
        return result.insertId;
    }

    static async updateProduct(id, name, description, price, image) {
        const [result] = await db.execute(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?',
            [name, description, price, image, id]
        );
        return result.affectedRows > 0;
    }

    static async deleteProduct(id) {
        const [result] = await db.execute('DELETE FROM productos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ProductModel;