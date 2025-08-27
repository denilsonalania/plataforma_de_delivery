document.addEventListener('DOMContentLoaded', () => {
    const orderList = document.getElementById('order-list');
    const orderModal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-btn');

    async function fetchOrders() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/pedidos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('No autorizado');
            }

            const orders = await response.json();

            orderList.innerHTML = '';
            if (orders.length === 0) {
                orderList.innerHTML = '<tr><td colspan="6">No hay pedidos realizados todavía.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                const statusClass = `status-${order.estado}`;
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.id_usuario}</td>
                    <td><span class="order-status ${statusClass}">${order.estado}</span></td>
                    <td>S/.${parseFloat(order.total).toFixed(2)}</td>
                    <td>${new Date(order.fecha_creacion).toLocaleString()}</td>
                    <td><button class="view-details-btn" data-id="${order.id}">Ver Detalles</button></td>
                `;
                orderList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            if (error.message === 'No autorizado') {
                alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login';
            }
        }
    }

    orderList.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        if (e.target.classList.contains('view-details-btn')) {
            const orderId = e.target.dataset.id;
            try {
                const response = await fetch(`/api/pedidos/${orderId}/detalles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const orderData = await response.json();

                document.getElementById('orderId').textContent = orderData.id;
                document.getElementById('client-name').textContent = orderData.nombre_cliente;
                document.getElementById('client-phone').textContent = orderData.celular_cliente;
                // --- ¡Aquí se rellena el nuevo campo! ---
                document.getElementById('driver-name').textContent = orderData.nombre_repartidor || 'No asignado';
                document.getElementById('restaurant-name').textContent = orderData.nombre_restaurante;
                document.getElementById('delivery-address').textContent = orderData.direccion_entrega;
                document.getElementById('order-status').textContent = orderData.estado;
                document.getElementById('order-total').textContent = `S/.${parseFloat(orderData.total).toFixed(2)}`;

                const productList = document.getElementById('product-list');
                productList.innerHTML = '';
                orderData.productos.forEach(product => {
                    const li = document.createElement('li');
                    li.textContent = `${product.nombre} - Cantidad: ${product.cantidad} (S/.${parseFloat(product.precio_unitario).toFixed(2)})`;
                    productList.appendChild(li);
                });

                document.getElementById('accept-order-btn').dataset.id = orderId;
                document.getElementById('cancel-order-btn').dataset.id = orderId;
                orderModal.style.display = 'block';

            } catch (error) {
                console.error('Error al obtener detalles del pedido:', error);
                alert('Error al obtener detalles del pedido.');
            }
        }
    });

    document.getElementById('accept-order-btn').addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        const orderId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/pedidos/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newStatus: 'aceptado' })
            });
            if (response.ok) {
                alert('Pedido aceptado.');
                orderModal.style.display = 'none';
                fetchOrders();
            } else {
                alert('Error al aceptar el pedido.');
            }
        } catch (error) {
            console.error('Error al aceptar el pedido:', error);
            alert('Error al aceptar el pedido.');
        }
    });

    document.getElementById('cancel-order-btn').addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        const orderId = e.target.dataset.id;
        if (confirm('¿Está seguro de que desea cancelar este pedido?')) {
            try {
                const response = await fetch(`/api/pedidos/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ newStatus: 'cancelado' })
                });
                if (response.ok) {
                    alert('Pedido cancelado.');
                    orderModal.style.display = 'none';
                    fetchOrders();
                } else {
                    alert('Error al cancelar el pedido.');
                }
            } catch (error) {
                console.error('Error al cancelar el pedido:', error);
                alert('Error al cancelar el pedido.');
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        orderModal.style.display = 'none';
    });

    fetchOrders();
});