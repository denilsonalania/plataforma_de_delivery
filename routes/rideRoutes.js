const express = require('express');
const router = express.Router();
const rideController = require('../controllers/RideController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/calcular_precio', authMiddleware, rideController.calculatePrice);
router.post('/request', authMiddleware, rideController.requestRide);
router.get('/available', authMiddleware, rideController.getAvailableRides);
router.put('/:rideId/accept', authMiddleware, rideController.acceptRide);
router.get('/asignados', authMiddleware, rideController.getAssignedRides);
router.put('/:rideId/entregar', authMiddleware, rideController.deliverRide);
router.get('/', authMiddleware, rideController.getAllRides); // <--- Nueva ruta para el dashboard de admin
router.get('/:rideId', authMiddleware, rideController.getRideDetails);

module.exports = router;