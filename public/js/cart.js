document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total-price');
    const shippingCostElement = document.getElementById('shipping-cost');

    let shippingCost = 0.00;

    async function calculateShippingCost(restaurantId) {
        // En una aplicación real, usarías Google Maps para la distancia
        const dummyDistance = 1;

        try {
            const response = await fetch(`/api/restaurantes/${restaurantId}`);
            const restaurant = await response.json();

            if (restaurant) {
                const baseCharge = parseFloat(restaurant.tarifa_base_delivery);
                const baseDistance = parseInt(restaurant.distancia_base_delivery);
                const extraCharge = parseFloat(restaurant.tarifa_extra_delivery);
                const extraDistance = parseInt(restaurant.distancia_extra_delivery);

                if (dummyDistance <= baseDistance) {
                    shippingCost = baseCharge;
                } else {
                    const extraDistanceTraveled = dummyDistance - baseDistance;
                    const extraChargeCalculated = (Math.ceil(extraDistanceTraveled / extraDistance) * extraCharge);
                    shippingCost = baseCharge + extraChargeCalculated;
                }
            }
        } catch (error) {
            console.error('Error al calcular el costo de envío:', error);
        }
    }

    async function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío.</p>';
            cartSummary.style.display = 'none';
            return;
        }

        cartSummary.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        // Obtener el ID del restaurante del primer producto en el carrito
        const restaurantId = cart[0]?.id_restaurante;

        if (restaurantId) {
            await calculateShippingCost(restaurantId);
        } else {
            shippingCost = 0.00;
        }

        const table = document.createElement('table');
        table.className = 'cart-items-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody id="cart-table-body"></tbody>
        `;
        cartItemsContainer.appendChild(table);
        const cartTableBody = document.getElementById('cart-table-body');

        cart.forEach(item => {
            const itemPrice = parseFloat(item.precio);
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="cart-item-info">
                        <img src="${item.imagen}" alt="${item.nombre}">
                        <span>${item.nombre}</span>
                    </div>
                </td>
                <td>S/.${itemPrice.toFixed(2)}</td>
                <td>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                </td>
                <td>S/.${itemTotal.toFixed(2)}</td>
                <td><button class="remove-btn" data-id="${item.id}">Eliminar</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        cartSubtotalElement.textContent = `S/.${subtotal.toFixed(2)}`;
        shippingCostElement.textContent = `S/.${shippingCost.toFixed(2)}`;
        cartTotalElement.textContent = `S/.${(subtotal + shippingCost).toFixed(2)}`;
    }

    document.body.addEventListener('click', (e) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const id = parseInt(e.target.dataset.id);

        if (e.target.classList.contains('remove-btn')) {
            const itemIndex = cart.findIndex(item => item.id === id);
            cart.splice(itemIndex, 1);
        } else if (e.target.classList.contains('quantity-btn')) {
            const itemIndex = cart.findIndex(item => item.id === id);
            if (e.target.dataset.action === 'increase') {
                cart[itemIndex].quantity += 1;
            } else if (e.target.dataset.action === 'decrease') {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    cart.splice(itemIndex, 1);
                }
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    });

    renderCart();
});