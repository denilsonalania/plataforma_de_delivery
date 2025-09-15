// Importa el módulo de conexión a la base de datos
const db = require('../config/db');

const AddressModel = {
    // Método para crear y guardar una nueva dirección en la base de datos
    create: (userId, address_line_1, latitude, longitude) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO addresses (user_id, address_line_1, latitude, longitude) VALUES (?, ?, ?, ?)';
            db.query(query, [userId, address_line_1, latitude, longitude], (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve({ id: result.insertId, user_id: userId, address_line_1, latitude, longitude });
            });
        });
    },

    // Método para encontrar todas las direcciones de un usuario por su ID
    findByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM addresses WHERE user_id = ?';
            db.query(query, [userId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },

    // Método para eliminar una dirección por su ID
    deleteById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM addresses WHERE id = ?';
            db.query(query, [id], (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
};

module.exports = AddressModel;