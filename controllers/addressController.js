// Importa el modelo de direcciones que interactuará con la base de datos
const AddressModel = require('../models/AddressModel');

// Controlador para guardar una nueva dirección
exports.saveAddress = async (req, res) => {
    try {
        const { userId, address_line_1, latitude, longitude } = req.body;

        // Validar que los datos necesarios están presentes
        if (!userId || !address_line_1 || !latitude || !longitude) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para guardar la dirección.' });
        }

        // Llamar al método del modelo para crear una nueva dirección en la base de datos
        const newAddress = await AddressModel.create(userId, address_line_1, latitude, longitude);

        res.status(201).json({
            message: 'Dirección guardada correctamente.',
            addressId: newAddress.id
        });

    } catch (error) {
        console.error('Error en addressController.saveAddress:', error);
        res.status(500).json({ error: 'Error interno del servidor al guardar la dirección.' });
    }
};

// Controlador para obtener todas las direcciones de un usuario
exports.getAddressesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Llamar al método del modelo para obtener las direcciones del usuario
        const addresses = await AddressModel.findByUserId(userId);

        res.status(200).json(addresses);

    } catch (error) {
        console.error('Error en addressController.getAddressesByUserId:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las direcciones.' });
    }
};

// Controlador para eliminar una dirección
exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        // Llamar al método del modelo para eliminar la dirección por su ID
        const result = await AddressModel.deleteById(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dirección no encontrada.' });
        }

        res.status(200).json({ message: 'Dirección eliminada correctamente.' });

    } catch (error) {
        console.error('Error en addressController.deleteAddress:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la dirección.' });
    }
};