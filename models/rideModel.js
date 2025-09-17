const db = require('../config/db');

class RideModel {
    static async createRide(userId, origin, destination, destinoLat, destinoLng, vehicleType, distance, price) {
        const [result] = await db.execute(
            `INSERT INTO viajes
                (id_usuario, origen, destino, destino_lat, destino_lng, tipo_vehiculo, distancia_km, precio_estimado, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, origin, destination, destinoLat, destinoLng, vehicleType, distance, price, 'buscando conductor']
        );
        return result.insertId;
    }

    static async getAvailableRides() {
        const [rows] = await db.execute(
            'SELECT * FROM viajes WHERE estado = ?',
            ['buscando conductor']
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
            `SELECT v.*,
                    u.nombre AS nombre_cliente,
                    u.celular AS celular_cliente,
                    c.nombre AS nombre_conductor
             FROM viajes v
             JOIN usuarios u ON v.id_usuario = u.id
             LEFT JOIN usuarios c ON v.id_conductor = c.id
             WHERE v.id = ?`,
            [rideId]
        );
        return rows[0];
    }

    static async acceptRide(rideId, driverId) {
        const [result] = await db.execute(
            'UPDATE viajes SET estado = ?, id_conductor = ? WHERE id = ? AND estado = ?',
            ['en camino', driverId, rideId, 'buscando conductor']
        );
        return result.affectedRows > 0;
    }

    static async getAssignedRides(driverId) {
        const [rows] = await db.execute(
            `SELECT * FROM viajes WHERE id_conductor = ? AND estado = ?`,
            [driverId, 'en camino']
        );
        return rows;
    }

    static async deliverRide(rideId) {
        const [result] = await db.execute(
            'UPDATE viajes SET estado = ? WHERE id = ?',
            ['finalizado', rideId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = RideModel;