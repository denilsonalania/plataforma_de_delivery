const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const jwtSecret = 'mi_clave_secreta_super_segura';

module.exports = {
    register: async (req, res) => {
        const { nombre, correo, contrasena, celular, rol } = req.body;

        try {
            const existingUser = await UserModel.findByEmail(correo);
            if (existingUser) {
                return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contrasena, salt);

            const userId = await UserModel.create(nombre, correo, hashedPassword, celular, rol);
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    login: async (req, res) => {
        const { correo, contrasena } = req.body;

        try {
            const user = await UserModel.findByEmail(correo);
            if (!user) {
                return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
            }

            const isMatch = await bcrypt.compare(contrasena, user.contrasena);
            if (!isMatch) {
                return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
            }

            const payload = {
                id: user.id,
                rol: user.rol,
                nombre: user.nombre
            };

            const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

            res.json({ message: 'Inicio de sesión exitoso', token, userId: user.id });
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};