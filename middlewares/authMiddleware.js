const jwt = require('jsonwebtoken');

// Asegúrate de que esta clave secreta sea la misma que usas para generar el token
// Idealmente, se debe obtener de una variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

exports.authenticateToken = (req, res, next) => {
    // Obtener el token del encabezado de la autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Token no proporcionado.' });
    }

    // Verificar el token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido.' });
        }
        req.user = user;
        next(); // Pasar el control al siguiente middleware o controlador
    });
};