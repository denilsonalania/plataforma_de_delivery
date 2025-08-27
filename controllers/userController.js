const UserModel = require('../models/UserModel');

module.exports = {
    getAll: async (req, res) => {
        try {
            const users = await UserModel.getAll();
            res.json(users);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await UserModel.getById(id);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Esta función ha sido modificada
    updateUser: async (req, res) => {
        const { id } = req.params;
        const { newRole, newPhone } = req.body; // <-- Ahora recibe ambos datos
        try {
            const updated = await UserModel.updateUser(id, newRole, newPhone); // <-- Llama a la nueva función del modelo
            if (updated) {
                res.json({ message: 'Usuario actualizado correctamente' });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    deleteUser: async (req, res) => {
        const { id } = req.params;
        try {
            const deleted = await UserModel.delete(id);
            if (deleted) {
                res.json({ message: 'Usuario eliminado' });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};