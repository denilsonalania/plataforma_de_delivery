const db = require('../config/db');

class PrizeModel {
    static async saveUserPrize(userId, prizeId) {
        const [result] = await db.execute(
            'INSERT INTO premios_ganados (id_usuario, id_premio) VALUES (?, ?)',
            [userId, prizeId]
        );
        return result.insertId;
    }

    static async getAvailablePrizes(userId) {
        const [rows] = await db.execute(
            `SELECT pg.id, pg.id_premio, p.nombre, p.descripcion
             FROM premios_ganados pg
             JOIN premios p ON pg.id_premio = p.id
             WHERE pg.id_usuario = ? AND pg.estado = 'pendiente'`,
            [userId]
        );
        return rows;
    }

    static async usePrize(prizeId) {
        const [result] = await db.execute(
            'UPDATE premios_ganados SET estado = "usado", fecha_usado = NOW() WHERE id = ?',
            [prizeId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = PrizeModel;