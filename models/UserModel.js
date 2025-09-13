const db = require('../config/db');

class UserModel {
    static async getAll() {
        const [rows] = await db.execute('SELECT id, nombre, correo, celular, rol, fecha_creacion FROM usuarios');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT id, nombre, correo, rol, celular FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE correo = ?', [email]);
        return rows[0];
    }

    static async create(nombre, correo, contrasena, celular, rol) {
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, correo, contrasena, celular, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, contrasena, celular, rol]
        );
        return result.insertId;
    }

    static async updateUser(id, newRole, newPhone) {
        const [result] = await db.execute('UPDATE usuarios SET rol = ?, celular = ? WHERE id = ?', [newRole, newPhone, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = UserModel;