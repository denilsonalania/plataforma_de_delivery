document.addEventListener('DOMContentLoaded', () => {
    const restaurantList = document.querySelector('.restaurant-list');
    const modal = document.getElementById('restaurantModal');
    const form = document.getElementById('restaurantForm');
    const addBtn = document.getElementById('addRestaurantBtn');
    const closeBtn = document.querySelector('.close-btn');

    const mapContainer = document.getElementById('map-container');
    const latInput = document.getElementById('latitud');
    const lngInput = document.getElementById('longitud');

    let map;
    let marker;

    // Función para inicializar el mapa
    window.initMap = (initialLat, initialLng) => {
        const lat = parseFloat(initialLat);
        const lng = parseFloat(initialLng);
        const defaultLocation = (isNaN(lat) || isNaN(lng)) ? { lat: -11.4333, lng: -75.6833 } : { lat: lat, lng: lng };

        if (!map) {
            map = new google.maps.Map(mapContainer, {
                zoom: 15,
                center: defaultLocation,
            });
            marker = new google.maps.Marker({
                map: map,
                draggable: true,
                title: "Arrastra para ubicar el negocio"
            });
            marker.addListener("dragend", () => {
                const newPosition = marker.getPosition();
                latInput.value = newPosition.lat();
                lngInput.value = newPosition.lng();
            });
        }

        map.setCenter(defaultLocation);
        marker.setPosition(defaultLocation);
        latInput.value = defaultLocation.lat;
        lngInput.value = defaultLocation.lng;
    };

    // Función para obtener y mostrar la lista de restaurantes
    async function fetchRestaurants() {
        const token = 'fake-token-for-testing'; // Usa un token de prueba
        try {
            const response = await fetch('/api/restaurantes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const restaurants = await response.json();

            if (restaurantList) {
                restaurantList.innerHTML = '';
                if (restaurants.length > 0) {
                    restaurants.forEach(rest => {
                        const item = document.createElement('div');
                        item.className = 'restaurant-item';
                        item.innerHTML = `
                            <h4>${rest.nombre}</h4>
                            <p>ID: ${rest.id}</p>
                            <p>${rest.descripcion}</p>
                            <p>Ubicación: ${rest.latitud}, ${rest.longitud}</p>
                            <a href="/dashboard/menu/${rest.id}" class="menu-btn">Ver Menú</a>
                            <button class="edit-btn" data-id="${rest.id}">Editar</button>
                            <button class="delete-btn" data-id="${rest.id}">Eliminar</button>
                        `;
                        restaurantList.appendChild(item);
                    });
                } else {
                    restaurantList.innerHTML = '<p>No hay negocios registrados. ¡Crea el primero!</p>';
                }
            }
        } catch (error) {
            console.error('Error al obtener los restaurantes:', error);
            if (restaurantList) {
                restaurantList.innerHTML = '<p>Error al cargar los restaurantes. Por favor, intente de nuevo.</p>';
            }
        }
    }

    addBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Crear Nuevo Restaurante';
        form.reset();
        modal.style.display = 'block';
        window.initMap(-11.4333, -75.6833);
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = 'fake-token-for-testing'; // Usa un token de prueba
        const restaurantId = document.getElementById('restaurantId').value;
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const image = document.getElementById('image').value;
        const baseCharge = document.getElementById('baseCharge').value;
        const baseDistance = document.getElementById('baseDistance').value;
        const extraCharge = document.getElementById('extraCharge').value;
        const extraDistance = document.getElementById('extraDistance').value;

        const latitud = document.getElementById('latitud').value;
        const longitud = document.getElementById('longitud').value;

        const method = restaurantId ? 'PUT' : 'POST';
        const url = restaurantId ? `/api/restaurantes/${restaurantId}` : '/api/restaurantes';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: name,
                    descripcion: description,
                    imagen: image,
                    latitud: parseFloat(latitud),
                    longitud: parseFloat(longitud),
                    tarifa_base_delivery: parseFloat(baseCharge),
                    distancia_base_delivery: parseInt(baseDistance),
                    tarifa_extra_delivery: parseFloat(extraCharge),
                    distancia_extra_delivery: parseInt(extraDistance)
                })
            });

            if (response.ok) {
                modal.style.display = 'none';
                fetchRestaurants();
            } else {
                const errorData = await response.json();
                alert(`Error al guardar el restaurante: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Error de conexión. Por favor, revisa la consola.');
        }
    });

    restaurantList.addEventListener('click', async (e) => {
        const token = 'fake-token-for-testing'; // Usa un token de prueba
        const id = e.target.dataset.id;

        if (e.target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`/api/restaurantes/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const restaurant = await response.json();

                document.getElementById('modalTitle').textContent = 'Editar Restaurante';
                document.getElementById('restaurantId').value = restaurant.id;
                document.getElementById('name').value = restaurant.nombre;
                document.getElementById('description').value = restaurant.descripcion;
                document.getElementById('image').value = restaurant.imagen;
                document.getElementById('address').value = restaurant.direccion;

                document.getElementById('baseCharge').value = restaurant.tarifa_base_delivery;
                document.getElementById('baseDistance').value = restaurant.distancia_base_delivery;
                document.getElementById('extraCharge').value = restaurant.tarifa_extra_delivery;
                document.getElementById('extraDistance').value = restaurant.distancia_extra_delivery;

                modal.style.display = 'block';

                window.initMap(restaurant.latitud, restaurant.longitud);

            } catch (error) {
                console.error('Error al cargar datos para editar:', error);
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Está seguro de que desea eliminar este restaurante?')) {
                try {
                    const response = await fetch(`/api/restaurantes/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        fetchRestaurants();
                    } else {
                        alert('Error al eliminar el restaurante.');
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                }
            }
        }
    });

    fetchRestaurants();
});