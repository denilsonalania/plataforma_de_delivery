const express = require('express');
const router = express.Router();
const { getAll, getById, updateUser, deleteUser } = require('../controllers/userController');

// Rutas para la gestión de usuarios
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;