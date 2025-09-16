const express = require('express');
const router = express.Router();
const rideController = require('../controllers/RideController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/calcular_precio', authMiddleware.authenticateToken, rideController.calculatePrice);
router.post('/request', authMiddleware.authenticateToken, rideController.requestRide);
router.get('/available', authMiddleware.authenticateToken, rideController.getAvailableRides);
router.put('/:rideId/accept', authMiddleware.authenticateToken, rideController.acceptRide);
router.get('/asignados', authMiddleware.authenticateToken, rideController.getAssignedRides);
router.put('/:rideId/entregar', authMiddleware.authenticateToken, rideController.deliverRide);
router.get('/', authMiddleware.authenticateToken, rideController.getAllRides); // <--- Nueva ruta para el dashboard de admin
router.get('/:rideId', authMiddleware.authenticateToken, rideController.getRideDetails);

module.exports = router;