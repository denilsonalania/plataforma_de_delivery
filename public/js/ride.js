document.addEventListener('DOMContentLoaded', () => {
    const rideForm = document.getElementById('ride-request-form');
    const rideTitle = document.getElementById('ride-title');
    const vehiculoInput = document.getElementById('vehiculo');
    const distanciaEstimadaElement = document.getElementById('distancia-estimada');
    const precioEstimadoElement = document.getElementById('precio-estimado');
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleType = urlParams.get('type');
    const token = localStorage.getItem('token');

    let distance = 0;

    if (vehicleType) {
        rideTitle.textContent = `Solicitar ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}`;
        vehiculoInput.value = vehicleType;
    }

    const directionsService = new google.maps.DirectionsService();

    const calculateDistanceAndPrice = async () => {
        const origen = document.getElementById('origen').value;
        const destino = document.getElementById('destino').value;
        const tipo_vehiculo = vehiculoInput.value;

        if (!token) {
            alert('Debes iniciar sesión para usar el servicio de transporte.');
            window.location.href = '/login';
            return;
        }

        if (origen && destino && tipo_vehiculo) {
            const request = {
                origin: origen + ', Tarma, Perú', // Añadimos la ciudad y el país
                destination: destino + ', Tarma, Perú',
                travelMode: google.maps.TravelMode.DRIVING,
            };

            try {
                const response = await directionsService.route(request);
                const route = response.routes[0];
                distance = route.legs[0].distance.value / 1000; // Distancia en km
                distanciaEstimadaElement.textContent = `${distance.toFixed(2)} km`;

                const precioResponse = await fetch('/api/rides/calcular_precio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ distancia: distance, tipo_vehiculo: tipo_vehiculo })
                });
                const data = await precioResponse.json();
                if (precioResponse.ok) {
                    precioEstimadoElement.textContent = `S/. ${data.precio}`;
                }
            } catch (error) {
                console.error('Error al calcular la distancia:', error);
                distanciaEstimadaElement.textContent = 'Error al calcular';
                precioEstimadoElement.textContent = 'S/. 0.00';
                distance = 0;
            }
        }
    };

    rideForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId || !token) {
            alert('Debes iniciar sesión para solicitar un viaje.');
            window.location.href = '/login';
            return;
        }

        const origen = document.getElementById('origen').value;
        const destino = document.getElementById('destino').value;
        const tipo_vehiculo = vehiculoInput.value;
        const precio = parseFloat(precioEstimadoElement.textContent.replace('S/. ', ''));

        if (distance === 0 || isNaN(precio)) {
            alert('Por favor, espera a que se calcule el precio estimado.');
            return;
        }

        try {
            const response = await fetch('/api/rides/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId, origen, destino, tipo_vehiculo, distancia: distance, precio })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`¡Viaje solicitado! Tu número de viaje es: ${data.rideId}`);
                window.location.href = '/';
            } else {
                alert(`Error al solicitar el viaje: ${data.error}`);
            }

        } catch (error) {
            console.error('Error al solicitar viaje:', error);
            alert('Error al solicitar viaje. Por favor, intente de nuevo.');
        }
    });

    const origenInput = document.getElementById('origen');
    const destinoInput = document.getElementById('destino');

    origenInput.addEventListener('change', calculateDistanceAndPrice);
    destinoInput.addEventListener('change', calculateDistanceAndPrice);
});