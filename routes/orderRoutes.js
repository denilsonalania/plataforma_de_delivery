const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas Públicas (no requieren autenticación)
// La ruta POST se dejó sin autenticación para el flujo del cliente.
router.post('/', orderController.createOrder);

// Rutas Protegidas (requieren un token de autenticación)
router.get('/', authMiddleware, orderController.getAllOrders);
router.get('/aceptados', authMiddleware, orderController.getAcceptedOrders);
router.get('/asignados', authMiddleware, orderController.getAssignedOrders);
router.get('/premios/disponibles', authMiddleware, orderController.getAvailablePrizes);

// Para evitar conflictos de rutas, hacemos la ruta de detalles más explícita
router.get('/:orderId/detalles', authMiddleware, orderController.getOrderDetails);

router.put('/:orderId/status', authMiddleware, orderController.updateStatus);
router.put('/:orderId/aceptar', authMiddleware, orderController.acceptOrder);
router.put('/:orderId/entregar', authMiddleware, orderController.deliverOrder);

// Nuevas rutas para el sistema de recompensas
router.get('/status', authMiddleware, orderController.getUserStatus);
router.post('/ruleta/girar', authMiddleware, orderController.spinRoulette);
router.post('/con-premio', authMiddleware, orderController.createOrderWithPrize);

module.exports = router;