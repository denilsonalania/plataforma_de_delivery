document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const totalPriceElement = document.getElementById('total-price');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const shippingCostElement = document.getElementById('shipping-cost');
    const addressInput = document.getElementById('address');

    let shippingCost = 0.00;
    let subtotal = 0.00;
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let restaurantId = cart[0]?.id_restaurante;

    // Función para calcular el costo de envío basado en la distancia
    async function calculateShippingCost(distanceInKm) {
        if (!restaurantId) return 0.00;

        try {
            const response = await fetch(`/api/restaurantes/${restaurantId}`);
            const restaurant = await response.json();

            const baseCharge = parseFloat(restaurant.tarifa_base_delivery);
            const baseDistance = parseInt(restaurant.distancia_base_delivery);
            const extraCharge = parseFloat(restaurant.tarifa_extra_delivery);
            const extraDistance = parseInt(restaurant.distancia_extra_delivery);

            if (distanceInKm <= baseDistance) {
                return baseCharge;
            } else {
                const extraDistanceTraveled = distanceInKm - baseDistance;
                const extraChargeCalculated = (Math.ceil(extraDistanceTraveled / extraDistance) * extraCharge);
                return baseCharge + extraChargeCalculated;
            }
        } catch (error) {
            console.error('Error al calcular el costo de envío:', error);
            return 0.00;
        }
    }

    // Función para actualizar los totales en la página
    function updateTotals() {
        shippingCostElement.textContent = `S/.${shippingCost.toFixed(2)}`;
        total = subtotal + shippingCost;
        totalPriceElement.textContent = `S/.${total.toFixed(2)}`;
    }

    // Lógica para inicializar el autocompletado de Google Maps
    window.initAutocomplete = async () => {
        const addressInput = document.getElementById('address');
        const autocomplete = new google.maps.places.Autocomplete(addressInput);
        let restaurantLocation;

        if (restaurantId) {
            try {
                const response = await fetch(`/api/restaurantes/${restaurantId}`);
                const restaurant = await response.json();

                // Agrega validación para asegurar que las coordenadas son números válidos
                if (restaurant.latitud && restaurant.longitud) {
                    const lat = parseFloat(restaurant.latitud);
                    const lng = parseFloat(restaurant.longitud);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        restaurantLocation = { lat: lat, lng: lng };
                    } else {
                        console.error("Coordenadas de restaurante no válidas en la base de datos.");
                    }
                } else {
                    console.error("Faltan las coordenadas del restaurante en la base de datos.");
                }

            } catch (error) {
                console.error('Error al obtener la ubicación del restaurante:', error);
            }
        }

        // Escuchar el evento cuando el usuario selecciona una dirección
        autocomplete.addListener('place_changed', async () => {
            const place = autocomplete.getPlace();
            if (place.geometry && restaurantLocation) {
                const directionsService = new google.maps.DirectionsService();

                directionsService.route({
                    origin: restaurantLocation,
                    destination: place.geometry.location,
                    travelMode: 'DRIVING'
                }, async (response, status) => {
                    if (status === 'OK') {
                        const distanceInMeters = response.routes[0].legs[0].distance.value;
                        const distanceInKm = distanceInMeters / 1000;
                        console.log('Distancia calculada (en km):', distanceInKm);
                        shippingCost = await calculateShippingCost(distanceInKm);
                        updateTotals();

                    } else {
                        console.error('Error al calcular la distancia:', status);
                        shippingCost = 0.00;
                        updateTotals();
                    }
                });
            } else {
                shippingCost = 0.00;
                updateTotals();
            }
        });
    };

    subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.quantity), 0);
    subtotalPriceElement.textContent = `S/.${subtotal.toFixed(2)}`;
    updateTotals();

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const address = addressInput.value;
        const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : null;
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert('Debes iniciar sesión para confirmar un pedido.');
            return;
        }

        const total = subtotal + shippingCost;

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    total: total,
                    deliveryAddress: address,
                    shippingCost: shippingCost,
                    cartItems: cart
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.removeItem('cart');
                alert(`¡Pedido confirmado! Tu número de pedido es: ${data.orderId}`);
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert(`Error al confirmar el pedido: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error al confirmar el pedido:', error);
            alert('Error al confirmar el pedido.');
        }
    });
});