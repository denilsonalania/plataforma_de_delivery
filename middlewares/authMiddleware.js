const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const secret = 'mi_clave_secreta_super_segura'; // La misma clave que en authController.js
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Se añade la información del usuario al objeto de la solicitud
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = authMiddleware;