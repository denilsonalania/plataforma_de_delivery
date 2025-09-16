let shippingCost = 0.00;
let restaurantLocation = null;
let map;
let marker;

// --- Actualiza totales ---
function updateTotals() {
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalPriceElement = document.getElementById('total-price');

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.quantity), 0);

    subtotalPriceElement.textContent = `S/.${subtotal.toFixed(2)}`;
    shippingCostElement.textContent = `S/.${shippingCost.toFixed(2)}`;
    totalPriceElement.textContent = `S/.${(subtotal + shippingCost).toFixed(2)}`;
}

// --- Inicializa el mapa ---
window.initMap = async () => {
    const defaultLocation = { lat: -11.416667, lng: -75.683333 }; // Tarma, Perú

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 15
    });

    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true
    });

    // Drag del marcador
    marker.addListener('dragend', async () => {
        await calculateDistanceAndPrice(marker.getPosition());
    });

    // Click en el mapa
    map.addListener('click', async (e) => {
        marker.setPosition(e.latLng);
        await calculateDistanceAndPrice(e.latLng);
    });
};

// --- Calcula distancia y costo ---
async function calculateDistanceAndPrice(destinationLocation) {
    if (!restaurantLocation) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
        origin: restaurantLocation,
        destination: destinationLocation,
        travelMode: 'DRIVING'
    }, async (response, status) => {
        if (status === 'OK') {
            const distanceInMeters = response.routes[0].legs[0].distance.value;
            const distanceInKm = distanceInMeters / 1000;

            // Geocodificar
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: destinationLocation }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    document.getElementById('address-line').value = results[0].formatted_address;
                }
            });

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const restaurantId = cart[0]?.id_restaurante;
            shippingCost = await calculateShippingCost(distanceInKm, restaurantId);
            updateTotals();
        } else {
            console.error('Error al calcular la distancia:', status);
            shippingCost = 0.00;
            updateTotals();
        }
    });
}

// --- Cálculo del costo de envío ---
async function calculateShippingCost(distanceInKm, restaurantId) {
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

// --- Al cargar DOM ---
document.addEventListener('DOMContentLoaded', async () => {
    updateTotals();

    // Obtener ubicación del restaurante
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const restaurantId = cart[0]?.id_restaurante;

    if (restaurantId) {
        try {
            const response = await fetch(`/api/restaurantes/${restaurantId}`);
            const restaurant = await response.json();
            if (restaurant?.latitud && restaurant?.longitud) {
                restaurantLocation = {
                    lat: parseFloat(restaurant.latitud),
                    lng: parseFloat(restaurant.longitud)
                };
            }
        } catch (error) {
            console.error('Error al obtener la ubicación del restaurante:', error);
        }
    }

    // Submit del pedido
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Debes iniciar sesión para confirmar un pedido.');
            window.location.href = '/login';
            return;
        }

        const address = document.getElementById('address-line').value;
        if (!address) {
            alert('Selecciona una ubicación en el mapa antes de continuar.');
            return;
        }

        const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : null;

        const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.quantity), 0);
        const total = subtotal + shippingCost;

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    total,
                    deliveryAddress: address,
                    shippingCost,
                    cartItems: cart,
                    paymentMethod
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
