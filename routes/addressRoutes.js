// Importa el módulo Express para crear el enrutador
const express = require('express');
const router = express.Router();

// Importa el controlador de direcciones para manejar la lógica de la API
const addressController = require('../controllers/addressController');

// Importa el middleware de autenticación para proteger las rutas
const { authenticateToken } = require('../middlewares/authMiddleware');

// --- Rutas para la gestión de direcciones de usuarios ---

// Ruta POST para guardar una nueva dirección de un usuario
// Requiere autenticación
router.post('/addresses', authenticateToken, addressController.saveAddress);

// Ruta GET para obtener todas las direcciones de un usuario específico
// El :userId en la URL es un parámetro dinámico para identificar al usuario
// Requiere autenticación
router.get('/users/:userId/addresses', authenticateToken, addressController.getAddressesByUserId);

// Ruta DELETE para eliminar una dirección por su ID
// El :id en la URL es el identificador único de la dirección
// Requiere autenticación
router.delete('/addresses/:id', authenticateToken, addressController.deleteAddress);

// Exporta el enrutador para que pueda ser utilizado en server.js
module.exports = router;