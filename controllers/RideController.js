const RideModel = require('../models/RideModel');

module.exports = {
    calculatePrice: async (req, res) => {
        const { distancia, tipo_vehiculo } = req.body;

        const tarifa_taxi = 1.00;
        const tarifa_mototaxi = 0.70;
        const precio_base_taxi = 3.50;
        const precio_base_mototaxi = 1.50;

        let precio_final = 0;

        if (tipo_vehiculo === 'taxi') {
            precio_final = precio_base_taxi + (distancia * tarifa_taxi);
        } else if (tipo_vehiculo === 'mototaxi') {
            precio_final = precio_base_mototaxi + (distancia * tarifa_mototaxi);
        }

        res.json({
            precio: precio_final.toFixed(2),
            distancia: distancia,
            vehiculo: tipo_vehiculo
        });
    },

    requestRide: async (req, res) => {
        const { userId, origen, destino, tipo_vehiculo, distancia, precio } = req.body;
        try {
            const rideId = await RideModel.createRide(userId, origen, destino, tipo_vehiculo, distancia, precio);
            res.status(201).json({ message: 'Viaje solicitado exitosamente', rideId });
        } catch (error) {
            console.error('Error al solicitar viaje:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    // Añade la coma para que no haya un error de sintaxis
    getAvailableRides: async (req, res) => {
        try {
            const rides = await RideModel.getAvailableRides();
            res.json(rides);
        } catch (error) {
            console.error('Error al obtener viajes disponibles:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    // ... (otras funciones que puedas haber añadido)
    acceptRide: async (req, res) => {
        const { rideId } = req.params;
        const driverId = req.user.id; // Obtenemos el ID del conductor desde el token JWT

        try {
            const accepted = await RideModel.acceptRide(rideId, driverId);
            if (accepted) {
                res.json({ message: 'Viaje aceptado y asignado correctamente' });
            } else {
                res.status(404).json({ error: 'Viaje no encontrado o ya asignado' });
            }
        } catch (error) {
            console.error('Error al aceptar viaje:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getAssignedRides: async (req, res) => {
        const driverId = req.user.id;
        try {
            const rides = await RideModel.getAssignedRides(driverId);
            res.json(rides);
        } catch (error) {
            console.error('Error al obtener viajes asignados:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    deliverRide: async (req, res) => {
        const { rideId } = req.params;
        try {
            const updated = await RideModel.deliverRide(rideId);
            if (updated) {
                res.json({ message: 'Viaje marcado como entregado' });
            } else {
                res.status(404).json({ error: 'Viaje no encontrado' });
            }
        } catch (error) {
            console.error('Error al entregar viaje:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getAllRides: async (req, res) => {
        try {
            const rides = await RideModel.getAllRides();
            res.json(rides);
        } catch (error) {
            console.error('Error al obtener viajes:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Añade el controlador para obtener los detalles de un viaje
    getRideDetails: async (req, res) => {
        const { rideId } = req.params;
        try {
            const ride = await RideModel.getRideById(rideId);
            if (ride) {
                res.json(ride);
            } else {
                res.status(404).json({ error: 'Viaje no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener detalles del viaje:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
};