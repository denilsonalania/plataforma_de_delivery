const RestaurantModel = require('../models/RestaurantModel');

module.exports = {
    getAll: async (req, res) => {
        try {
            const restaurantes = await RestaurantModel.getAll();
            res.json(restaurantes);
        } catch (error) {
            console.error('Error al obtener restaurantes:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const restaurante = await RestaurantModel.getById(id);
            if (restaurante) {
                res.json(restaurante);
            } else {
                res.status(404).json({ error: 'Restaurante no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener restaurante por ID:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    create: async (req, res) => {
        const { nombre, descripcion, imagen, latitud, longitud, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery } = req.body;
        const id_dueño = req.user ? req.user.id : 1;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del restaurante es obligatorio' });
        }

        try {
            const newId = await RestaurantModel.create(nombre, descripcion, imagen, latitud, longitud, id_dueño, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery);
            res.status(201).json({ id: newId, message: 'Restaurante creado exitosamente' });
        } catch (error) {
            console.error('Error al crear restaurante:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { nombre, descripcion, imagen, latitud, longitud, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery } = req.body;

        try {
            const updated = await RestaurantModel.update(id, nombre, descripcion, imagen, latitud, longitud, tarifa_base_delivery, distancia_base_delivery, tarifa_extra_delivery, distancia_extra_delivery);
            if (updated) {
                res.json({ message: 'Restaurante actualizado exitosamente' });
            } else {
                res.status(404).json({ error: 'Restaurante no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar restaurante:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    deleteRestaurant: async (req, res) => {
        const { id } = req.params;

        try {
            const deleted = await RestaurantModel.delete(id);
            if (deleted) {
                res.json({ message: 'Restaurante eliminado exitosamente' });
            } else {
                res.status(404).json({ error: 'Restaurante no encontrado' });
            }
        } catch (error) {
            console.error('Error al eliminar restaurante:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};