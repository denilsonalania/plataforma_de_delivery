const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas Públicas (no requieren autenticación)
router.post('/', orderController.createOrder);

// Rutas Protegidas (requieren un token de autenticación)
router.get('/', authMiddleware.authenticateToken, orderController.getAllOrders);
router.get('/aceptados', authMiddleware.authenticateToken, orderController.getAcceptedOrders);
router.get('/asignados', authMiddleware.authenticateToken, orderController.getAssignedOrders);
router.get('/premios/disponibles', authMiddleware.authenticateToken, orderController.getAvailablePrizes);

// Para evitar conflictos de rutas, hacemos la ruta de detalles más explícita
router.get('/:orderId/detalles', authMiddleware.authenticateToken, orderController.getOrderDetails);

router.put('/:orderId/status', authMiddleware.authenticateToken, orderController.updateStatus);
router.put('/:orderId/aceptar', authMiddleware.authenticateToken, orderController.acceptOrder);
router.put('/:orderId/entregar', authMiddleware.authenticateToken, orderController.deliverOrder);

// Nuevas rutas para el sistema de recompensas
router.get('/status', authMiddleware.authenticateToken, orderController.getUserStatus);
router.post('/ruleta/girar', authMiddleware.authenticateToken, orderController.spinRoulette);
router.post('/con-premio', authMiddleware.authenticateToken, orderController.createOrderWithPrize);

// Ruta para obtener los pedidos de un usuario
router.get('/user/:userId', authMiddleware.authenticateToken, orderController.getOrdersByUser);

module.exports = router;