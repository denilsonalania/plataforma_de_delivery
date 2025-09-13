const db = require('../config/db');

class RideModel {
    static async createRide(userId, origin, destination, vehicleType, price) {
        const [result] = await db.execute(
            'INSERT INTO viajes (id_usuario, origen, destino, tipo_vehiculo, precio_estimado, estado) VALUES (?, ?, ?, ?, ?, "buscando conductor")',
            [userId, origin, destination, vehicleType, price]
        );
        return result.insertId;
    }
    static async getAvailableRides() {
        const [rows] = await db.execute(
            'SELECT * FROM viajes WHERE estado = "buscando conductor"'
        );
        return rows;
    }
    static async getAllRides() {
        const [rows] = await db.execute(
            'SELECT * FROM viajes ORDER BY fecha_solicitud DESC'
        );
        return rows;
    }

    static async getRideById(rideId) {
        const [rows] = await db.execute(
            `SELECT v.*, u.nombre AS nombre_cliente, u.celular AS celular_cliente,
                    c.nombre AS nombre_conductor
             FROM viajes v
             JOIN usuarios u ON v.id_usuario = u.id
             LEFT JOIN usuarios c ON v.id_conductor = c.id
             WHERE v.id = ?`,
            [rideId]
        );
        return rows[0];
    }
    // Nueva función para aceptar un viaje
    static async acceptRide(rideId, driverId) {
        const [result] = await db.execute(
            'UPDATE viajes SET estado = "en camino", id_conductor = ? WHERE id = ? AND estado = "buscando conductor"',
            [driverId, rideId]
        );
        return result.affectedRows > 0;
    }
    // Nueva función: Obtener los viajes asignados a un conductor
    static async getAssignedRides(driverId) {
        const [rows] = await db.execute(
            `SELECT * FROM viajes WHERE id_conductor = ? AND estado = "en camino"`,
            [driverId]
        );
        return rows;
    }

    // Nueva función: Marcar viaje como entregado
    static async deliverRide(rideId) {
        const [result] = await db.execute(
            'UPDATE viajes SET estado = "finalizado" WHERE id = ?',
            [rideId]
        );
        return result.affectedRows > 0;
    }

}

module.exports = RideModel;