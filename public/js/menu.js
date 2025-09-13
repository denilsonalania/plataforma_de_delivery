document.addEventListener('DOMContentLoaded', () => {
    const urlParts = window.location.pathname.split('/');
    const restaurantId = urlParts[urlParts.length - 1];

    const menuContainer = document.getElementById('menu-container');
    const categoryModal = document.getElementById('categoryModal');
    const categoryForm = document.getElementById('categoryForm');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');

    // Mueve la declaración de productPrice dentro del event listener del formulario

    // Eventos para los modales
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        document.getElementById('categoryModalTitle').textContent = 'Crear Nueva Categoría';
        categoryForm.reset();
        categoryModal.style.display = 'block';
    });

    document.querySelector('.category-close').addEventListener('click', () => {
        categoryModal.style.display = 'none';
    });

    document.querySelector('.product-close').addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    // Lógica para cerrar modales al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
        if (event.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    // Envío del formulario de Categoría
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryName = document.getElementById('categoryName').value;
        const token = 'fake-token';

        const response = await fetch('/api/productos/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, restaurantId })
        });
        if (response.ok) {
            categoryModal.style.display = 'none';
            fetchCategoriesAndProducts();
        } else {
            alert('Error al crear categoría.');
        }
    });

    // Envío del formulario de Producto
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('productId').value;
        const productCategoryId = document.getElementById('productCategoryId').value;
        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const productPrice = document.getElementById('productPrice').value;
        const productImage = document.getElementById('productImage').value;
        const token = 'fake-token';

        const method = productId ? 'PUT' : 'POST';

        // --- Lógica Corregida ---
        let url = method === 'PUT' ? `/api/productos/${productId}` : '/api/productos';
        // --- Fin de la Lógica Corregida ---

        const body = {
            name: productName,
            description: productDescription,
            price: productPrice !== '' ? parseFloat(productPrice) : 0,
            image: productImage,
            categoryId: productCategoryId
        };

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            productModal.style.display = 'none';
            fetchCategoriesAndProducts();
        } else {
            alert(`Error al guardar el producto: ${response.statusText}`);
        }
    });

    // Función principal para cargar el menú
    async function fetchCategoriesAndProducts() {
        const token = 'fake-token';
        try {
            const categoriesResponse = await fetch(`/api/productos/categorias/${restaurantId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const categories = await categoriesResponse.json();

            menuContainer.innerHTML = '';

            for (const category of categories) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category-section';
                categoryDiv.innerHTML = `
                    <h3>${category.nombre}</h3>
                    <button class="add-product-btn" data-category-id="${category.id}">Crear Producto</button>
                    <div class="product-list" data-category-id="${category.id}"></div>
                `;
                menuContainer.appendChild(categoryDiv);

                const productsResponse = await fetch(`/api/productos/${category.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const products = await productsResponse.json();
                const productList = categoryDiv.querySelector('.product-list');

                products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-management-card';
                    productItem.innerHTML = `
                        <h4>${product.nombre}</h4>
                        <p>Precio: S/.${product.precio}</p>
                        <p>${product.descripcion}</p>
                        <img src="${product.imagen}" alt="${product.nombre}" style="width:100px;">
                        <button class="edit-product-btn" data-product-id="${product.id}">Editar</button>
                        <button class="delete-product-btn" data-product-id="${product.id}">Eliminar</button>
                    `;
                    productList.appendChild(productItem);
                });
            }

        } catch (error) {
            console.error('Error al cargar el menú:', error);
            menuContainer.innerHTML = '<p>Error al cargar el menú. Por favor, intente de nuevo.</p>';
        }
    }

    // Delegación de eventos para los botones de editar y eliminar
    menuContainer.addEventListener('click', async (e) => {
        const token = 'fake-token';

        // Lógica del botón de "Editar Producto"
        if (e.target.classList.contains('edit-product-btn')) {
            const productId = e.target.dataset.productId;
            try {
                const response = await fetch(`/api/productos/unico/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const product = await response.json();

                document.getElementById('productModalTitle').textContent = 'Editar Producto';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.nombre;
                document.getElementById('productDescription').value = product.descripcion;
                document.getElementById('productPrice').value = product.precio;
                document.getElementById('productImage').value = product.imagen;
                document.getElementById('productCategoryId').value = product.id_categoria;

                productModal.style.display = 'block';

            } catch (error) {
                console.error('Error al cargar datos para editar:', error);
                alert('Error al cargar datos para editar.');
            }
        }

        // Lógica del botón de "Eliminar Producto"
        if (e.target.classList.contains('delete-product-btn')) {
            const productId = e.target.dataset.productId;
            if (confirm('¿Está seguro de que desea eliminar este producto?')) {
                try {
                    const response = await fetch(`/api/productos/${productId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        fetchCategoriesAndProducts();
                    } else {
                        alert('Error al eliminar el producto.');
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    alert('Error al eliminar el producto.');
                }
            }
        }

        // Lógica del botón "Crear Producto"
        if (e.target.classList.contains('add-product-btn')) {
            const categoryId = e.target.dataset.categoryId;
            document.getElementById('productModalTitle').textContent = 'Crear Nuevo Producto';
            productForm.reset();
            document.getElementById('productCategoryId').value = categoryId;
            productModal.style.display = 'block';
        }
    });

    // Iniciar la carga del menú al entrar en la página
    fetchCategoriesAndProducts();
});