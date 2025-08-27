const db = require('../config/db');

class RestaurantModel {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM restaurantes');
        return rows;
    }

    static async getById(id) {
        // Ahora seleccionamos latitud y longitud
        const [rows] = await db.execute('SELECT * FROM restaurantes WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(nombre, descripcion, imagen, latitud, longitud, id_dueño, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery) {
        const [result] = await db.execute(
            'INSERT INTO restaurantes (nombre, descripcion, imagen, latitud, longitud, id_dueño, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, imagen, latitud, longitud, id_dueño, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery]
        );
        return result.insertId;
    }

    static async update(id, nombre, descripcion, imagen, latitud, longitud, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery) {
        const [result] = await db.execute(
            'UPDATE restaurantes SET nombre = ?, descripcion = ?, imagen = ?, latitud = ?, longitud = ?, tarifa_base_delivery = ?, distancia_base_delivery = ?, tarifa_extra_delivery = ?, distancia_extra_delivery = ? WHERE id = ?',
            [nombre, descripcion, imagen, latitud, longitud, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM restaurantes WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getDeliveryCharges(restaurantId) {
        const [rows] = await db.execute(
            'SELECT tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery FROM restaurantes WHERE id = ?',
            [restaurantId]
        );
        return rows[0];
    }
}

module.exports = RestaurantModel;