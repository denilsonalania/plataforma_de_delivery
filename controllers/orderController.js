const OrderModel = require('../models/OrderModel');
const PrizeModel = require('../models/PrizeModel');

module.exports = {
    createOrder: async (req, res) => {
        const { userId, total, deliveryAddress, cartItems } = req.body;
        try {
            const orderId = await OrderModel.createOrder(userId, total, deliveryAddress, cartItems);

            const orderCount = await OrderModel.getOrderCountInLast30Days(userId);
            let userStatus = 'Normal';

            if (orderCount >= 20) {
                userStatus = 'Rubí';
            } else if (orderCount >= 15) {
                userStatus = 'Diamante';
            } else if (orderCount >= 10) {
                userStatus = 'Oro';
            }
            res.status(201).json({ message: 'Pedido creado exitosamente', orderId, userStatus });
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getAllOrders: async (req, res) => {
        try {
            const orders = await OrderModel.getAllOrders();
            res.json(orders);
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getAcceptedOrders: async (req, res) => {
        try {
            const orders = await OrderModel.getAcceptedOrders();
            const correctedOrders = orders.map(order => ({
                ...order,
                total: parseFloat(order.total)
            }));
            res.json(correctedOrders);
        } catch (error) {
            console.error('Error al obtener pedidos aceptados:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    acceptOrder: async (req, res) => {
        const { orderId } = req.params;
        const driverId = req.user.id;

        try {
            const accepted = await OrderModel.acceptOrder(orderId, driverId);
            if (accepted) {
                res.json({ message: 'Pedido aceptado y asignado' });
            } else {
                res.status(404).json({ error: 'Pedido no encontrado o ya asignado' });
            }
        } catch (error) {
            console.error('Error al aceptar el pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getOrderDetails: async (req, res) => {
        const { orderId } = req.params;
        try {
            const order = await OrderModel.getOrderById(orderId);
            const products = await OrderModel.getOrderDetails(orderId);
            if (order) {
                res.json({ ...order, productos: products });
            } else {
                res.status(404).json({ error: 'Pedido no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getAssignedOrders: async (req, res) => {
        const driverId = req.user.id;
        try {
            const orders = await OrderModel.getAssignedOrders(driverId);
            const correctedOrders = orders.map(order => ({
                ...order,
                total: parseFloat(order.total)
            }));
            res.json(correctedOrders);
        } catch (error) {
            console.error('Error al obtener pedidos asignados:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    deliverOrder: async (req, res) => {
        const { orderId } = req.params;
        try {
            const updated = await OrderModel.deliverOrder(orderId);
            if (updated) {
                res.json({ message: 'Pedido marcado como entregado' });
            } else {
                res.status(404).json({ error: 'Pedido no encontrado' });
            }
        } catch (error) {
            console.error('Error al entregar pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    updateStatus: async (req, res) => {
        const { orderId } = req.params;
        const { newStatus } = req.body;
        try {
            const updated = await OrderModel.updateOrderStatus(orderId, newStatus);
            if (updated) {
                res.json({ message: 'Estado del pedido actualizado' });
            } else {
                res.status(404).json({ error: 'Pedido no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getUserStatus: async (req, res) => {
        try {
            const userId = req.user.id;
            const status = await OrderModel.getUserStatus(userId);
            res.json({ status });
        } catch (error) {
            console.error('Error al obtener el estatus del usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    spinRoulette: async (req, res) => {
        try {
            const userId = req.user.id;
            const status = await OrderModel.getUserStatus(userId);

            if (status === 'Normal') {
                return res.status(403).json({ error: 'No tienes estatus de recompensa para girar la ruleta.' });
            }

            const prize = await OrderModel.getRandomPrize();
            await OrderModel.saveSpin(userId, prize.id);
            await PrizeModel.saveUserPrize(userId, prize.id);

            res.json({ prize });
        } catch (error) {
            console.error('Error al girar la ruleta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    getAvailablePrizes: async (req, res) => {
        try {
            const userId = req.user.id;
            const prizes = await PrizeModel.getAvailablePrizes(userId);
            res.json(prizes);
        } catch (error) {
            console.error('Error al obtener premios disponibles:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    createOrderWithPrize: async (req, res) => {
        const { userId, total, deliveryAddress, cartItems, prizeId } = req.body;

        try {
            if (prizeId) {
                await PrizeModel.usePrize(prizeId);
            }
            const orderId = await OrderModel.createOrder(userId, total, deliveryAddress, cartItems);

            const orderCount = await OrderModel.getOrderCountInLast30Days(userId);
            let userStatus = 'Normal';
            if (orderCount >= 20) {
                userStatus = 'Rubí';
            } else if (orderCount >= 15) {
                userStatus = 'Diamante';
            } else if (orderCount >= 10) {
                userStatus = 'Oro';
            }
            res.status(201).json({ message: 'Pedido creado exitosamente', orderId, userStatus });
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};