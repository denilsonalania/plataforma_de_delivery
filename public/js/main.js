document.addEventListener('DOMContentLoaded', () => {
    const restaurantList = document.getElementById('restaurant-list');
    const authLinks = document.getElementById('auth-links');
    const userStatusContainer = document.getElementById('user-status-container');
    const userStatusElement = document.getElementById('user-status');
    const rouletteContainer = document.getElementById('roulette-container');
    const spinRouletteBtn = document.getElementById('spin-roulette-btn');
    const prizeResult = document.getElementById('prize-result');

    async function fetchUserStatus() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/pedidos/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.status !== 'Normal') {
                userStatusContainer.style.display = 'block';
                userStatusElement.textContent = data.status;
                rouletteContainer.style.display = 'block';
            }

        } catch (error) {
            console.error('Error al obtener el estatus del usuario:', error);
        }
    }

    function renderAuthLinks() {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwt_decode(token);
            const userName = decodedToken.nombre;

            authLinks.innerHTML = `
                <span>Hola, ${userName}</span>
                <a href="/cart">Mi Carrito</a>
                <a href="#" id="logout-btn">Cerrar Sesión</a>
            `;

            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/';
            });

            fetchUserStatus();
        }
    }

    async function fetchRestaurants() {
        try {
            const response = await fetch('/api/restaurantes');
            const restaurants = await response.json();

            restaurantList.innerHTML = '';

            if (restaurants.length === 0) {
                restaurantList.innerHTML = '<p>No hay restaurantes disponibles en este momento.</p>';
                return;
            }

            restaurants.forEach(restaurant => {
                const restaurantCard = document.createElement('a');
                restaurantCard.href = `/menu/${restaurant.id}`;
                restaurantCard.className = 'restaurant-card';

                restaurantCard.innerHTML = `
                    <img src="${restaurant.imagen}" alt="${restaurant.nombre}">
                    <div class="restaurant-info">
                        <h3>${restaurant.nombre}</h3>
                        <p>${restaurant.descripcion}</p>
                        <p>Tiempo de entrega: ${restaurant.tiempo_aprox} min</p>
                        <div class="rating">${'⭐'.repeat(Math.floor(restaurant.rating))} (${restaurant.rating})</div>
                        <p>${restaurant.direccion}</p>
                    </div>
                `;

                restaurantList.appendChild(restaurantCard);
            });

        } catch (error) {
            console.error('Error al obtener los restaurantes:', error);
            restaurantList.innerHTML = '<p>Error al cargar los restaurantes. Por favor, intente de nuevo.</p>';
        }
    }

    spinRouletteBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            prizeResult.textContent = 'Girando...';
            spinRouletteBtn.disabled = true;

            const response = await fetch('/api/pedidos/ruleta/girar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                prizeResult.textContent = `¡Felicidades! Ganaste: ${data.prize.nombre}`;
            } else {
                prizeResult.textContent = data.error;
            }
        } catch (error) {
            console.error('Error al girar la ruleta:', error);
            prizeResult.textContent = 'Error al girar la ruleta.';
        } finally {
            spinRouletteBtn.disabled = false;
        }
    });

    renderAuthLinks();
    fetchRestaurants();
});