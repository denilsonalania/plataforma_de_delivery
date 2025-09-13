// tu_plataforma_delivery/middlewares/roleMiddleware.js
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Lógica para verificar el rol del usuario
        // Por ahora, solo simula que el usuario tiene un rol
        const userRole = req.user ? req.user.rol : 'cliente'; // Asume que req.user existe

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Acceso denegado. No tiene el rol necesario.' });
        }
        next();
    };
};

module.exports = roleMiddleware;