document.addEventListener('DOMContentLoaded', () => {
    const ridesList = document.getElementById('rides-list');
    const rideModal = document.getElementById('rideModal');
    const closeBtn = document.querySelector('.close-btn');

    async function fetchAllRides() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const response = await fetch('/api/rides', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const rides = await response.json();

            ridesList.innerHTML = '';
            rides.forEach(ride => {
                const row = document.createElement('tr');
                const statusClass = `status-${ride.estado.replace(' ', '_')}`;
                row.innerHTML = `
                    <td>${ride.id}</td>
                    <td>${ride.id_usuario}</td>
                    <td>${ride.origen}</td>
                    <td>${ride.destino}</td>
                    <td>${ride.tipo_vehiculo}</td>
                    <td><span class="order-status ${statusClass}">${ride.estado}</span></td>
                    <td><button class="view-details-btn" data-id="${ride.id}">Ver Detalles</button></td>
                `;
                ridesList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener viajes:', error);
        }
    }

    ridesList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('view-details-btn')) {
            const rideId = e.target.dataset.id;
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`/api/rides/${rideId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const rideData = await response.json();

                document.getElementById('rideId').textContent = rideData.id;
                document.getElementById('client-name-ride').textContent = rideData.nombre_cliente;
                document.getElementById('client-phone-ride').textContent = rideData.celular_cliente;
                // --- ¡Aquí se rellena el nuevo campo! ---
                document.getElementById('driver-name').textContent = rideData.nombre_conductor || 'No asignado';
                document.getElementById('ride-origin').textContent = rideData.origen;
                document.getElementById('ride-destination').textContent = rideData.destino;
                document.getElementById('ride-price').textContent = `S/.${rideData.precio_estimado}`;
                document.getElementById('ride-status').textContent = rideData.estado;

                rideModal.style.display = 'block';
            } catch (error) {
                console.error('Error al obtener detalles del viaje:', error);
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        rideModal.style.display = 'none';
    });

    fetchAllRides();
});