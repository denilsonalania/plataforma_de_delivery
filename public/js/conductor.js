document.addEventListener('DOMContentLoaded', () => {
    const availableRidesList = document.getElementById('available-rides-list');
    const assignedRidesList = document.getElementById('assigned-rides-list');

    async function fetchAvailableRides() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/rides/available', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('No autorizado');
            }

            const rides = await response.json();

            availableRidesList.innerHTML = '';
            if (rides.length === 0) {
                availableRidesList.innerHTML = '<tr><td colspan="6">No hay viajes disponibles para aceptar.</td></tr>';
                return;
            }

            rides.forEach(ride => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ride.id}</td>
                    <td>${ride.origen}</td>
                    <td>${ride.destino}</td>
                    <td>${ride.tipo_vehiculo}</td>
                    <td>S/.${parseFloat(ride.precio_estimado).toFixed(2)}</td>
                    <td><button class="accept-ride-btn" data-id="${ride.id}">Aceptar Viaje</button></td>
                `;
                availableRidesList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener viajes disponibles:', error);
        }
    }

    async function fetchAssignedRides() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/rides/asignados', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('No autorizado');
            }

            const rides = await response.json();

            assignedRidesList.innerHTML = '';
            if (rides.length === 0) {
                assignedRidesList.innerHTML = '<tr><td colspan="6">No tienes viajes asignados.</td></tr>';
                return;
            }

            rides.forEach(ride => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ride.id}</td>
                    <td>${ride.origen}</td>
                    <td>${ride.destino}</td>
                    <td>${ride.tipo_vehiculo}</td>
                    <td>S/.${parseFloat(ride.precio_estimado).toFixed(2)}</td>
                    <td><button class="deliver-ride-btn" data-id="${ride.id}">Marcar como Entregado</button></td>
                `;
                assignedRidesList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener viajes asignados:', error);
        }
    }

    // Delegación de eventos para las tablas
    document.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Lógica para Aceptar un Viaje
        if (e.target.classList.contains('accept-ride-btn')) {
            const rideId = e.target.dataset.id;
            try {
                const response = await fetch(`/api/rides/${rideId}/accept`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    alert('Has aceptado el viaje. ¡El cliente te está esperando!');
                    fetchAvailableRides();
                    fetchAssignedRides();
                } else {
                    const errorData = await response.json();
                    alert(`Error al aceptar el viaje: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error al aceptar el viaje:', error);
            }
        }

        // Lógica para Marcar como Entregado
        if (e.target.classList.contains('deliver-ride-btn')) {
            const rideId = e.target.dataset.id;
            if (confirm('¿Está seguro de que desea marcar este viaje como entregado?')) {
                try {
                    const response = await fetch(`/api/rides/${rideId}/entregar`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        alert('Viaje entregado exitosamente.');
                        fetchAvailableRides();
                        fetchAssignedRides();
                    } else {
                        const errorData = await response.json();
                        alert(`Error al marcar el viaje como entregado: ${errorData.error}`);
                    }
                } catch (error) {
                    console.error('Error al entregar viaje:', error);
                }
            }
        }
    });

    // Iniciar la carga de viajes
    fetchAvailableRides();
    fetchAssignedRides();
});