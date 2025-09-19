const express = require('express');
const router = express.Router();
const RideController = require('../controllers/RideController'); // <--- CORRECCIÓN DE MAYÚSCULAS
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/calcular_precio', authMiddleware.authenticateToken, RideController.calculatePrice); // <--- CORRECCIÓN
router.post('/request', authMiddleware.authenticateToken, RideController.requestRide); // <--- CORRECCIÓN
router.get('/available', authMiddleware.authenticateToken, RideController.getAvailableRides); // <--- CORRECCIÓN
router.put('/:rideId/accept', authMiddleware.authenticateToken, RideController.acceptRide); // <--- CORRECCIÓN
router.get('/asignados', authMiddleware.authenticateToken, RideController.getAssignedRides); // <--- CORRECCIÓN
router.put('/:rideId/entregar', authMiddleware.authenticateToken, RideController.deliverRide); // <--- CORRECCIÓN
router.get('/', authMiddleware.authenticateToken, RideController.getAllRides); // <--- CORRECCIÓN
router.get('/:rideId', authMiddleware.authenticateToken, RideController.getRideDetails); // <--- CORRECCIÓN

module.exports = router;