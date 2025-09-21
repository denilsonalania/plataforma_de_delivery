document.addEventListener('DOMContentLoaded', () => {
    const urlParts = window.location.pathname.split('/');
    const restaurantId = urlParts[urlParts.length - 1];

    const restaurantNameElement = document.getElementById('restaurant-name');
    const restaurantDescElement = document.getElementById('restaurant-description');
    const menuContainer = document.getElementById('menu-container');

    async function fetchRestaurantDetails() {
        try {
            const resDetails = await fetch(`/api/restaurantes/${restaurantId}`);
            const restaurant = await resDetails.json();

            if (restaurant) {
                restaurantNameElement.textContent = restaurant.nombre;
                restaurantDescElement.textContent = restaurant.descripcion;
                fetchMenu();
            } else {
                menuContainer.innerHTML = '<p>Restaurante no encontrado.</p>';
            }
        } catch (error) {
            console.error('Error al obtener detalles del restaurante:', error);
            menuContainer.innerHTML = '<p>Error al cargar el restaurante.</p>';
        }
    }

    async function fetchMenu() {
        try {
            const resCategories = await fetch(`/api/productos/categorias/${restaurantId}`);
            const categories = await resCategories.json();

            menuContainer.innerHTML = '';

            if (categories.length === 0) {
                menuContainer.innerHTML = '<p>Este restaurante aún no tiene productos en su menú.</p>';
                return;
            }

            for (const category of categories) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'menu-section';
                categoryDiv.innerHTML = `<h3>${category.nombre}</h3><div class="product-grid" id="category-${category.id}"></div>`;
                menuContainer.appendChild(categoryDiv);

                // CORRECCIÓN: URL corregida para obtener productos de una categoría
                const resProducts = await fetch(`/api/productos/categoria/${category.id}`);
                const products = await resProducts.json();
                const productGrid = document.getElementById(`category-${category.id}`);

                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <img src="${product.imagen}" alt="${product.nombre}">
                        <div class="product-info">
                            <h4>${product.nombre}</h4>
                            <p>${product.descripcion}</p>
                            <div class="product-footer">
                                <span>S/.${product.precio}</span>
                                <button class="add-to-cart-btn" data-product-id="${product.id}">Añadir al Carrito</button>
                            </div>
                        </div>
                    `;
                    productGrid.appendChild(productCard);
                });
            }

        } catch (error) {
            console.error('Error al obtener el menú:', error);
            menuContainer.innerHTML = '<p>Error al cargar el menú. Por favor, intente de nuevo.</p>';
        }
    }

    // Lógica para el botón "Añadir al Carrito"
    menuContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.productId;

            try {
                // CORRECCIÓN: URL corregida para obtener un solo producto
                const response = await fetch(`/api/productos/${productId}`);
                const product = await response.json();

                if (product) {
                    product.precio = parseFloat(product.precio);

                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

                    if (cart.length > 0 && cart[0].id_restaurante !== product.id_restaurante) {
                        const confirmClear = confirm('Tu carrito ya contiene productos de otro restaurante. ¿Quieres limpiar tu carrito y añadir este producto?');
                        if (confirmClear) {
                            localStorage.setItem('cart', JSON.stringify([{ ...product, quantity: 1 }]));
                            alert(`${product.nombre} ha sido añadido al carrito.`);
                            return;
                        } else {
                            return;
                        }
                    }

                    const existingItem = cart.find(item => item.id === product.id);

                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        product.quantity = 1;
                        cart.push(product);
                    }

                    localStorage.setItem('cart', JSON.stringify(cart));
                    alert(`${product.nombre} ha sido añadido al carrito.`);
                }
            } catch (error) {
                console.error('Error al añadir producto al carrito:', error);
                alert('Error al añadir producto al carrito.');
            }
        }
    });

    if (restaurantId) {
        fetchRestaurantDetails();
    } else {
        menuContainer.innerHTML = '<p>ID de restaurante no especificado.</p>';
    }
});