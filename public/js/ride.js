// Renombramos la función de callback de la API de Google Maps
function initMap() {
  const rideForm = document.getElementById('ride-request-form');
  const rideTitle = document.getElementById('ride-title');
  const vehiculoInput = document.getElementById('vehiculo');
  const distanciaEstimadaElement = document.getElementById('distancia-estimada');
  const precioEstimadoElement = document.getElementById('precio-estimado');

  const origenInput = document.getElementById('origen');
  const destinoInput = document.getElementById('destino');
  const destinoLatInput = document.getElementById('destino-lat');
  const destinoLngInput = document.getElementById('destino-lng');

  const getGeolocationBtn = document.getElementById('get-location-btn');

  const urlParams = new URLSearchParams(window.location.search);
  const vehicleType = urlParams.get('type');

  let distance = 0;
  let originLocation;
  let destinationLocation;
  let destinationMap;
  let destinationMarker;

  // --- Configurar tipo de vehículo desde la URL ---
  if (vehicleType) {
    rideTitle.textContent = `Solicitar ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}`;
    vehiculoInput.value = vehicleType;
  }

  const directionsService = new google.maps.DirectionsService();

  // --- Calcular distancia y precio ---
  const calculateDistanceAndPrice = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para usar el servicio de transporte.');
      window.location.href = '/login';
      return;
    }

    if (originLocation && destinationLocation && vehiculoInput.value) {
      const request = {
        origin: originLocation,
        destination: destinationLocation,
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
          body: JSON.stringify({ distancia: distance, tipo_vehiculo: vehiculoInput.value })
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

  // --- Inicializar mapa de destino ---
  const initDestinationMap = () => {
    const defaultLocation = { lat: -11.416667, lng: -75.683333 }; // Tarma, Perú

    destinationMap = new google.maps.Map(document.getElementById('destination-map'), {
      center: defaultLocation,
      zoom: 15,
    });

    destinationMarker = new google.maps.Marker({
      position: defaultLocation,
      map: destinationMap,
      draggable: true
    });

    destinationMarker.addListener('dragend', async () => {
      destinationLocation = destinationMarker.getPosition();
      destinoLatInput.value = destinationLocation.lat();
      destinoLngInput.value = destinationLocation.lng();

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: destinationLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          destinoInput.value = results[0].formatted_address;
        }
      });

      await calculateDistanceAndPrice();
    });

    destinationMap.addListener('click', async (e) => {
      destinationMarker.setPosition(e.latLng);
      destinationLocation = e.latLng;
      destinoLatInput.value = e.latLng.lat();
      destinoLngInput.value = e.latLng.lng();

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          destinoInput.value = results[0].formatted_address;
        }
      });

      await calculateDistanceAndPrice();
    });
  };
  initDestinationMap();

  // --- Botón de geolocalización (origen) ---
  getGeolocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        originLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: originLocation }, (results, status) => {
          if (status === 'OK' && results[0]) {
            origenInput.value = results[0].formatted_address;
            calculateDistanceAndPrice();
          } else {
            alert('No se pudo obtener tu dirección.');
          }
        });
      }, (error) => {
        console.error('Error de geolocalización:', error);
        alert('No se pudo obtener tu ubicación. Activa el GPS.');
      });
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  });

  // --- Enviar formulario ---
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
    const destinoLat = parseFloat(destinoLatInput.value);
    const destinoLng = parseFloat(destinoLngInput.value);
    const tipo_vehiculo = vehiculoInput.value;
    const precio = parseFloat(precioEstimadoElement.textContent.replace('S/. ', ''));

    if (!origen || !destino || distance === 0 || isNaN(precio)) {
      alert('Debes establecer origen, destino y esperar el cálculo del precio.');
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
}