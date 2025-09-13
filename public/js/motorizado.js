document.addEventListener('DOMContentLoaded', () => {
    const acceptedOrdersList = document.getElementById('accepted-orders-list');
    const assignedOrdersList = document.getElementById('assigned-orders-list');
    const orderModal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-btn');

    async function fetchAcceptedOrders() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/pedidos/aceptados', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const orders = await response.json();

            acceptedOrdersList.innerHTML = '';
            if (orders.length === 0) {
                acceptedOrdersList.innerHTML = '<tr><td colspan="7">No hay pedidos disponibles para aceptar.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.nombre_cliente}</td>
                    <td>${order.celular_cliente}</td>
                    <td>${order.nombre_restaurante}</td>
                    <td>${order.direccion_entrega}</td>
                    <td>S/.${parseFloat(order.total).toFixed(2)}</td>
                    <td>
                        <button class="accept-btn" data-id="${order.id}">Aceptar Pedido</button>
                        <button class="view-details-btn" data-id="${order.id}">Ver Detalles</button>
                    </td>
                `;
                acceptedOrdersList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener pedidos aceptados:', error);
        }
    }

    async function fetchAssignedOrders() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/pedidos/asignados', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('No autorizado');
            }

            const orders = await response.json();

            assignedOrdersList.innerHTML = '';
            if (orders.length === 0) {
                assignedOrdersList.innerHTML = '<tr><td colspan="6">No tienes pedidos asignados.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.nombre_cliente}</td>
                    <td>${order.nombre_restaurante}</td>
                    <td>${order.direccion_entrega}</td>
                    <td>S/.${parseFloat(order.total).toFixed(2)}</td>
                    <td>
                        <button class="view-details-btn" data-id="${order.id}">Ver Detalles</button>
                        <button class="deliver-btn" data-id="${order.id}">Marcar como Entregado</button>
                    </td>
                `;
                assignedOrdersList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener pedidos asignados:', error);
        }
    }

    document.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        if (e.target.classList.contains('accept-btn')) {
            const orderId = e.target.dataset.id;
            try {
                const response = await fetch(`/api/pedidos/${orderId}/aceptar`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    alert('Has aceptado el pedido. ¡Dirígete al restaurante!');
                    fetchAcceptedOrders();
                    fetchAssignedOrders();
                } else {
                    const errorData = await response.json();
                    alert(`Error al aceptar el pedido: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error al aceptar el pedido:', error);
            }
        }

        if (e.target.classList.contains('view-details-btn')) {
            const orderId = e.target.dataset.id;
            try {
                // --- CORRECCIÓN: Se añade '/detalles' a la URL ---
                const response = await fetch(`/api/pedidos/${orderId}/detalles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const orderData = await response.json();

                document.getElementById('orderId').textContent = orderData.id;
                document.getElementById('client-name').textContent = orderData.nombre_cliente;
                document.getElementById('client-phone').textContent = orderData.celular_cliente;
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

                const deliverBtn = document.getElementById('mark-delivered-btn');
                if (orderData.estado === 'en_camino') {
                    deliverBtn.style.display = 'block';
                    deliverBtn.dataset.id = orderId;
                } else {
                    deliverBtn.style.display = 'none';
                }

                orderModal.style.display = 'block';
            } catch (error) {
                console.error('Error al obtener detalles del pedido:', error);
                alert('Error al obtener detalles del pedido.');
            }
        }

        if (e.target.classList.contains('deliver-btn')) {
            const orderId = e.target.dataset.id;
            if (confirm('¿Está seguro de que desea marcar este pedido como entregado?')) {
                try {
                    const response = await fetch(`/api/pedidos/${orderId}/entregar`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        alert('Pedido entregado exitosamente.');
                        orderModal.style.display = 'none';
                        fetchAcceptedOrders();
                        fetchAssignedOrders();
                    } else {
                        const errorData = await response.json();
                        alert(`Error al marcar el pedido como entregado: ${errorData.error}`);
                    }
                } catch (error) {
                    console.error('Error al entregar pedido:', error);
                }
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        orderModal.style.display = 'none';
    });

    fetchAcceptedOrders();
    fetchAssignedOrders();
});