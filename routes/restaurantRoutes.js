const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, deleteRestaurant } = require('../controllers/restauranteController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', deleteRestaurant);

module.exports = router;