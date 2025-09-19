// Variables globales para que estén disponibles para Google Maps
let distance = 0;
let origenLocation;
let destinoLocation;
let origenMap;
let destinoMap;
let origenMarker;
let destinoMarker;
let origenAutocomplete;
let destinoAutocomplete;
let directionsService;
let geocoder;

// Variables de elementos DOM
let rideForm;
let rideTitle;
let vehiculoInput;
let distanciaEstimadaElement;
let precioEstimadoElement;
let origenInput;
let destinoInput;
let origenLatInput;
let origenLngInput;
let destinoLatInput;
let destinoLngInput;

// Función global para inicializar los mapas (requerida por Google Maps API)
function initMap() {
    const defaultLocation = { lat: -11.416667, lng: -75.683333 }; // Tarma, Perú

    // Inicializar servicios de Google Maps
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();

    // Inicializar el mapa para el origen
    origenMap = new google.maps.Map(document.getElementById('origin-map'), {
        center: defaultLocation,
        zoom: 15,
    });

    // Inicializar el mapa para el destino
    destinoMap = new google.maps.Map(document.getElementById('destination-map'), {
        center: defaultLocation,
        zoom: 15,
    });

    // Inicializar los Autocomplete para los campos de texto (ERROR CORREGIDO)
    origenAutocomplete = new google.maps.places.Autocomplete(origenInput);
    destinoAutocomplete = new google.maps.places.Autocomplete(destinoInput);

    // Marcador para el origen
    origenMarker = new google.maps.Marker({
        position: defaultLocation,
        map: origenMap,
        draggable: true
    });

    // Marcador para el destino
    destinoMarker = new google.maps.Marker({
        position: defaultLocation,
        map: destinoMap,
        draggable: true
    });

    // --- Event listeners para el origen ---
    origenAutocomplete.addListener('place_changed', () => {
        const place = origenAutocomplete.getPlace();
        if (place.geometry) {
            origenLocation = place.geometry.location;
            origenMarker.setPosition(origenLocation);
            origenMap.setCenter(origenLocation);
            origenLatInput.value = origenLocation.lat();
            origenLngInput.value = origenLocation.lng();
            calculateDistanceAndPrice();
        }
    });

    origenMarker.addListener('dragend', () => {
        origenLocation = origenMarker.getPosition();
        geocoder.geocode({ location: origenLocation }, (results, status) => {
            if (status === 'OK' && results[0]) {
                origenInput.value = results[0].formatted_address;
                origenLatInput.value = origenLocation.lat();
                origenLngInput.value = origenLocation.lng();
                calculateDistanceAndPrice();
            }
        });
    });

    // --- Event listeners para el destino ---
    destinoAutocomplete.addListener('place_changed', () => {
        const place = destinoAutocomplete.getPlace();
        if (place.geometry) {
            destinoLocation = place.geometry.location;
            destinoMarker.setPosition(destinoLocation);
            destinoMap.setCenter(destinoLocation);
            destinoLatInput.value = destinoLocation.lat();
            destinoLngInput.value = destinoLocation.lng();
            calculateDistanceAndPrice();
        }
    });

    destinoMarker.addListener('dragend', () => {
        destinoLocation = destinoMarker.getPosition();
        geocoder.geocode({ location: destinoLocation }, (results, status) => {
            if (status === 'OK' && results[0]) {
                destinoInput.value = results[0].formatted_address;
                destinoLatInput.value = destinoLocation.lat();
                destinoLngInput.value = destinoLocation.lng();
                calculateDistanceAndPrice();
            }
        });
    });
}

const calculateDistanceAndPrice = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para usar el servicio de transporte.');
        window.location.href = '/login';
        return;
    }

    const origen = origenInput.value;
    const destino = destinoInput.value;
    const tipo_vehiculo = vehiculoInput.value;

    if (origen && destino && tipo_vehiculo) {
        const request = {
            origin: origen + ', Tarma, Perú',
            destination: destino + ', Tarma, Perú',
            travelMode: google.maps.TravelMode.DRIVING,
        };

        try {
            const response = await directionsService.route(request);
            const route = response.routes[0];
            distance = route.legs[0].distance.value / 1000;
            distanciaEstimadaElement.textContent = `${distance.toFixed(2)} km`;

            const precioResponse = await fetch('/api/rides/calcular_precio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ distancia: distance, tipo_vehiculo: tipo_vehiculo })
            });

            if (precioResponse.status === 401 || precioResponse.status === 403) {
                alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/login';
                return;
            }

            if (!precioResponse.ok) {
                const errorData = await precioResponse.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            const data = await precioResponse.json();
            precioEstimadoElement.textContent = `S/. ${data.precio}`;
        } catch (error) {
            console.error('Error al calcular la distancia o el precio:', error);
            distanciaEstimadaElement.textContent = 'Error al calcular';
            precioEstimadoElement.textContent = 'S/. 0.00';
            distance = 0;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos DOM
    rideForm = document.getElementById('ride-request-form');
    rideTitle = document.getElementById('ride-title');
    vehiculoInput = document.getElementById('vehiculo');
    distanciaEstimadaElement = document.getElementById('distancia-estimada');
    precioEstimadoElement = document.getElementById('precio-estimado');
    origenInput = document.getElementById('origen');
    destinoInput = document.getElementById('destino');
    origenLatInput = document.getElementById('origen-lat');
    origenLngInput = document.getElementById('origen-lng');
    destinoLatInput = document.getElementById('destino-lat');
    destinoLngInput = document.getElementById('destino-lng');

    const urlParams = new URLSearchParams(window.location.search);
    const vehicleType = urlParams.get('type');

    // --- Configurar tipo de vehículo desde la URL ---
    if (vehicleType) {
        rideTitle.textContent = `Solicitar ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}`;
        vehiculoInput.value = vehicleType;
    }

    rideForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!userId || !token) {
            alert('Debes iniciar sesión para solicitar un viaje.');
            window.location.href = '/login';
            return;
        }

        const origen = origenInput.value;
        const destino = destinoInput.value;
        const origenLat = parseFloat(origenLatInput.value);
        const origenLng = parseFloat(origenLngInput.value);
        const destinoLat = parseFloat(destinoLatInput.value);
        const destinoLng = parseFloat(destinoLngInput.value);
        const tipo_vehiculo = vehiculoInput.value;
        const precio = parseFloat(precioEstimadoElement.textContent.replace('S/. ', ''));

        if (!origen || !destino || distance === 0 || isNaN(precio) || isNaN(origenLat) || isNaN(origenLng) || isNaN(destinoLat) || isNaN(destinoLng)) {
            alert('Debes establecer origen y destino válidos, y esperar el cálculo del precio.');
            return;
        }

        try {
            const response = await fetch('/api/rides/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    userId,
                    origen,
                    destino,
                    origenLat,
                    origenLng,
                    destinoLat,
                    destinoLng,
                    tipo_vehiculo,
                    distancia: distance,
                    precio
                })
            });

            const data = await response.json();

            if (response.status === 401) {
                alert('Tu sesión ha expirado. Inicia sesión de nuevo.');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                alert(`¡Viaje solicitado! Tu número de viaje es: ${data.rideId}`);
                window.location.href = '/';
            } else {
                alert(`Error al solicitar el viaje: ${data.error}`);
            }
        } catch (error) {
            console.error('Error al solicitar viaje:', error);
            alert('Error al solicitar viaje. Intenta de nuevo.');
        }
    });
});