const db = require('../config/db');

class OrderModel {
    static async createOrder(userId, total, deliveryAddress, orderDetails) {
        const [orderResult] = await db.execute(
            'INSERT INTO pedidos (id_usuario, total, estado, direccion_entrega) VALUES (?, ?, "pendiente", ?)',
            [userId, total, deliveryAddress]
        );
        const orderId = orderResult.insertId;

        for (const item of orderDetails) {
            await db.execute(
                'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.precio]
            );
        }
        return orderId;
    }

    static async getAllOrders() {
        const [rows] = await db.execute('SELECT * FROM pedidos ORDER BY fecha_creacion DESC');
        return rows;
    }

    // Función para obtener pedidos con estado 'aceptado' y sin repartidor asignado
    static async getAcceptedOrders() {
        const [rows] = await db.execute(
            `SELECT p.id, p.id_usuario, p.total, p.estado, p.direccion_entrega, p.fecha_creacion,
                    u.nombre AS nombre_cliente, u.celular AS celular_cliente, r.nombre AS nombre_restaurante
             FROM pedidos p
             LEFT JOIN usuarios u ON p.id_usuario = u.id
             LEFT JOIN detalle_pedido dp ON p.id = dp.id_pedido
             LEFT JOIN productos pr ON dp.id_producto = pr.id
             LEFT JOIN categorias c ON pr.id_categoria = c.id
             LEFT JOIN restaurantes r ON c.id_restaurante = r.id
             WHERE p.estado = "aceptado" AND p.id_repartidor IS NULL
             GROUP BY p.id, u.nombre, u.celular, r.nombre, p.id_usuario, p.total, p.estado, p.direccion_entrega, p.fecha_creacion
            `
        );
        return rows;
    }

    // Obtener pedidos asignados a un repartidor
    static async getAssignedOrders(driverId) {
        const [rows] = await db.execute(
            `SELECT p.id, p.id_usuario, p.total, p.estado, p.direccion_entrega, p.fecha_creacion,
                    u.nombre AS nombre_cliente, u.celular AS celular_cliente, r.nombre AS nombre_restaurante
             FROM pedidos p
             LEFT JOIN usuarios u ON p.id_usuario = u.id
             LEFT JOIN detalle_pedido dp ON p.id = dp.id_pedido
             LEFT JOIN productos pr ON dp.id_producto = pr.id
             LEFT JOIN categorias c ON pr.id_categoria = c.id
             LEFT JOIN restaurantes r ON c.id_restaurante = r.id
             WHERE p.id_repartidor = ? AND p.estado = "en_camino"
             GROUP BY p.id, u.nombre, u.celular, r.nombre, p.id_usuario, p.total, p.estado, p.direccion_entrega, p.fecha_creacion
            `,
            [driverId]
        );
        return rows;
    }

    static async acceptOrder(orderId, driverId) {
        const [result] = await db.execute(
            'UPDATE pedidos SET estado = "en_camino", id_repartidor = ? WHERE id = ? AND estado = "aceptado"',
            [driverId, orderId]
        );
        return result.affectedRows > 0;
    }

    static async deliverOrder(orderId) {
        const [result] = await db.execute(
            'UPDATE pedidos SET estado = "entregado" WHERE id = ?',
            [orderId]
        );
        return result.affectedRows > 0;
    }

    static async getOrderById(orderId) {
        const [rows] = await db.execute(`
            SELECT p.*,
                   u.nombre AS nombre_cliente, u.celular AS celular_cliente,
                   rep.nombre AS nombre_repartidor,
                   r.nombre AS nombre_restaurante
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id
            LEFT JOIN usuarios rep ON p.id_repartidor = rep.id
            JOIN detalle_pedido dp ON p.id = dp.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id
            JOIN categorias c ON pr.id_categoria = c.id
            JOIN restaurantes r ON c.id_restaurante = r.id
            WHERE p.id = ?`, [orderId]);
        return rows[0];
    }

    static async getOrderDetails(orderId) {
        const [rows] = await db.execute(
            'SELECT d.cantidad, d.precio_unitario, p.nombre FROM detalle_pedido d JOIN productos p ON d.id_producto = p.id WHERE d.id_pedido = ?',
            [orderId]
        );
        return rows;
    }

    static async updateOrderStatus(orderId, newStatus) {
        const [result] = await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [newStatus, orderId]);
        return result.affectedRows > 0;
    }

    // Conteo de pedidos entregados
    static async getOrderCountInLast30Days(userId) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS order_count FROM pedidos WHERE id_usuario = ? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND estado = "entregado"',
            [userId]
        );
        return rows[0].order_count;
    }

    // Obtener estatus del usuario
    static async getUserStatus(userId) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS order_count FROM pedidos WHERE id_usuario = ? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND estado = "entregado"',
            [userId]
        );
        const orderCount = rows[0].order_count;
        let status = 'Normal';
        if (orderCount >= 20) {
            status = 'Rubí';
        } else if (orderCount >= 15) {
            status = 'Diamante';
        } else if (orderCount >= 10) {
            status = 'Oro';
        }
        return status;
    }

    // Obtener un premio al azar
    static async getRandomPrize() {
        const [prizes] = await db.execute('SELECT * FROM premios');
        let totalProb = 0;
        for (const p of prizes) {
            totalProb += parseFloat(p.probabilidad);
        }

        let rand = Math.random() * totalProb;
        let prize = null;

        for (const p of prizes) {
            if (rand < p.probabilidad) {
                prize = p;
                break;
            }
            rand -= p.probabilidad;
        }
        return prize;
    }

    // Guardar el historial de giros
    static async saveSpin(userId, prizeId) {
        const [result] = await db.execute(
            'INSERT INTO giros_ruleta (id_usuario, id_premio) VALUES (?, ?)',
            [userId, prizeId]
        );
        return result.insertId;
    }
}

module.exports = OrderModel;