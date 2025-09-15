// Variable global para el costo de envío.
let shippingCost = 0.00;
let restaurantLocation = null;
let savedAddresses = [];

// Esta función se encarga de actualizar los totales en la página y es global.
function updateTotals() {
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalPriceElement = document.getElementById('total-price');

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.quantity), 0);

    subtotalPriceElement.textContent = `S/.${subtotal.toFixed(2)}`;
    shippingCostElement.textContent = `S/.${shippingCost.toFixed(2)}`;
    const total = subtotal + shippingCost;
    totalPriceElement.textContent = `S/.${total.toFixed(2)}`;
}

// Esta función es llamada por initAutocomplete y es global.
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

// Esta función es llamada por el callback de la API de Google Maps.
window.initAutocomplete = () => {
    const addressInput = document.getElementById('address');
    const autocomplete = new google.maps.places.Autocomplete(addressInput);

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
        } else {
            shippingCost = 0.00;
            updateTotals();
        }
    });
};

// El resto de la lógica se inicializa al cargar el DOM.
document.addEventListener('DOMContentLoaded', async () => {
    const checkoutForm = document.getElementById('checkout-form');
    const addressInput = document.getElementById('address');
    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const newAddressContainer = document.getElementById('new-address-container');
    const savedAddressesSelect = document.getElementById('saved-addresses');
    const addNewAddressLink = document.getElementById('add-new-address-link');
    const saveAddressCheckbox = document.getElementById('save-address-checkbox');

    // Inicializar los totales al cargar la página.
    updateTotals();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const restaurantId = cart[0]?.id_restaurante;

    // Obtener la ubicación del restaurante.
    if (restaurantId) {
        try {
            const response = await fetch(`/api/restaurantes/${restaurantId}`);
            const restaurant = await response.json();
            if (restaurant && restaurant.latitud && restaurant.longitud) {
                const lat = parseFloat(restaurant.latitud);
                const lng = parseFloat(restaurant.longitud);
                if (!isNaN(lat) && !isNaN(lng)) {
                    restaurantLocation = { lat: lat, lng: lng };
                }
            }
        } catch (error) {
            console.error('Error al obtener la ubicación del restaurante:', error);
        }
    }

    // Obtener las direcciones guardadas del usuario.
    const userId = localStorage.getItem('userId');
    if (userId) {
        try {
            const response = await fetch(`/api/users/${userId}/addresses`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                savedAddresses = await response.json();
                if (savedAddresses.length > 0) {
                    savedAddressesContainer.style.display = 'block';
                    newAddressContainer.style.display = 'none';
                    savedAddresses.forEach(address => {
                        const option = document.createElement('option');
                        option.value = `${address.latitude},${address.longitude}`;
                        option.textContent = address.address_line_1;
                        savedAddressesSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error al obtener las direcciones guardadas:', error);
        }
    }

    // Escuchar cambios en el menú desplegable de direcciones guardadas.
    savedAddressesSelect.addEventListener('change', async () => {
        const selectedValue = savedAddressesSelect.value;
        if (selectedValue && restaurantLocation) {
            const [lat, lng] = selectedValue.split(',').map(parseFloat);
            const selectedLocation = { lat, lng };
            const directionsService = new google.maps.DirectionsService();

            directionsService.route({
                origin: restaurantLocation,
                destination: selectedLocation,
                travelMode: 'DRIVING'
            }, async (response, status) => {
                if (status === 'OK') {
                    const distanceInMeters = response.routes[0].legs[0].distance.value;
                    const distanceInKm = distanceInMeters / 1000;
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const restaurantId = cart[0]?.id_restaurante;
                    shippingCost = await calculateShippingCost(distanceInKm, restaurantId);
                    updateTotals();
                } else {
                    shippingCost = 0.00;
                    updateTotals();
                }
            });
        }
    });

    // Escuchar el clic en el enlace para agregar nueva dirección.
    addNewAddressLink.addEventListener('click', (e) => {
        e.preventDefault();
        savedAddressesContainer.style.display = 'none';
        newAddressContainer.style.display = 'block';
    });

    // Escuchar el envío del formulario.
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const address = addressInput.value;
        const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : null;

        if (!userId) {
            alert('Debes iniciar sesión para confirmar un pedido.');
            return;
        }

        let deliveryAddress = address;
        let finalShippingCost = shippingCost;
        let finalDistance = null;

        if (savedAddressesContainer.style.display !== 'none' && savedAddressesSelect.value) {
            const selectedAddress = savedAddresses.find(addr => `${addr.latitude},${addr.longitude}` === savedAddressesSelect.value);
            deliveryAddress = selectedAddress.address_line_1;
            finalShippingCost = shippingCost;
            finalDistance = null; // Asumimos que la distancia ya fue calculada
        } else {
            // Lógica para una nueva dirección.
            const place = await new Promise(resolve => autocomplete.addListener('place_changed', () => resolve(autocomplete.getPlace())));
            if (place.geometry) {
                const directionsService = new google.maps.DirectionsService();
                const routeResponse = await new Promise(resolve => {
                    directionsService.route({
                        origin: restaurantLocation,
                        destination: place.geometry.location,
                        travelMode: 'DRIVING'
                    }, (response, status) => {
                        if (status === 'OK') resolve(response);
                        else resolve(null);
                    });
                });
                if (routeResponse) {
                    finalDistance = routeResponse.routes[0].legs[0].distance.value / 1000;
                    finalShippingCost = await calculateShippingCost(finalDistance, restaurantId);
                }
            }

            // Guardar la nueva dirección si la casilla está marcada.
            if (saveAddressCheckbox.checked && place.geometry) {
                try {
                    const saveAddressResponse = await fetch('/api/addresses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify({
                            userId: userId,
                            address_line_1: place.formatted_address,
                            latitude: place.geometry.location.lat(),
                            longitude: place.geometry.location.lng()
                        })
                    });
                    if (!saveAddressResponse.ok) {
                        console.error('Error al guardar la nueva dirección.');
                    }
                } catch (error) {
                    console.error('Error al comunicarse con el servidor para guardar la dirección.', error);
                }
            }
        }

        const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.quantity), 0);
        const total = subtotal + finalShippingCost;

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    total: total,
                    deliveryAddress: deliveryAddress,
                    shippingCost: finalShippingCost,
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