document.addEventListener('DOMContentLoaded', () => {
    const urlParts = window.location.pathname.split('/');
    const restaurantId = urlParts[urlParts.length - 1];

    const menuContainer = document.getElementById('menu-container');
    const categoryModal = document.getElementById('categoryModal');
    const categoryForm = document.getElementById('categoryForm');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');

    // Button/closer handlers
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        document.getElementById('categoryModalTitle').textContent = 'Crear Nueva Categoría';
        categoryForm.reset();
        categoryModal.style.display = 'block';
    });
    document.querySelector('.category-close').addEventListener('click', () => categoryModal.style.display = 'none');
    document.querySelector('.product-close').addEventListener('click', () => productModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) categoryModal.style.display = 'none';
        if (event.target === productModal) productModal.style.display = 'none';
    });

    // --- Create category ---
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryName = document.getElementById('categoryName').value;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesión expirada. Inicia sesión.');
            window.location.href = '/login';
            return;
        }

        const res = await fetch('/api/productos/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: categoryName, restaurantId })
        });

        if (res.ok) {
            categoryModal.style.display = 'none';
            fetchCategoriesAndProducts();
        } else {
            const text = await res.text().catch(() => null);
            console.error('Error crear categoría', res.status, text);
            alert('Error al crear categoría.');
        }
    });

    // --- Create product ---
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('productId').value;
        const productCategoryId = document.getElementById('productCategoryId').value;
        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const productPrice = document.getElementById('productPrice').value;
        const productImage = document.getElementById('productImage').value;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesión expirada. Inicia sesión.');
            window.location.href = '/login';
            return;
        }

        const method = 'POST';
        const url = '/api/productos';

        const body = {
            name: productName,
            description: productDescription,
            price: productPrice !== '' ? parseFloat(productPrice) : 0,
            image: productImage,
            categoryId: productCategoryId
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const txt = await response.text().catch(() => null);
                console.error(`Error ${method} ${url}`, response.status, txt);
                alert(`Error al guardar el producto. Estado: ${response.status}`);
                return;
            }

            productModal.style.display = 'none';
            fetchCategoriesAndProducts();
        } catch (err) {
            console.error('Error /save product', err);
            alert('Error al guardar el producto.');
        }
    });

    // --- Load categories and products ---
    async function fetchCategoriesAndProducts() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesión expirada. Inicia sesión.');
            window.location.href = '/login';
            return;
        }

        try {
            const categoriesResponse = await fetch(`/api/productos/categorias/${restaurantId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!categoriesResponse.ok) {
                const t = await categoriesResponse.text().catch(() => null);
                console.error('Error categories', categoriesResponse.status, t);
                menuContainer.innerHTML = '<p>Error al cargar las categorías.</p>';
                return;
            }

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

                if (!productsResponse.ok) {
                    const t = await productsResponse.text().catch(() => null);
                    console.error(`Error fetching products for category ${category.id}`, productsResponse.status, t);
                    continue;
                }

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

    // --- Event delegation: delete / create ---
    menuContainer.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesión expirada. Inicia sesión.');
            window.location.href = '/login';
            return;
        }

        // DELETE
        if (e.target.classList.contains('delete-product-btn')) {
            const productId = e.target.dataset.productId;
            if (!confirm('¿Está seguro de que desea eliminar este producto?')) return;
            const url = `/api/productos/${productId}`;
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const txt = await response.text().catch(() => null);
                    console.error('DELETE failed', response.status, txt);
                    alert('Error al eliminar el producto.');
                    return;
                }

                fetchCategoriesAndProducts();
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el producto.');
            }
        }

        // CREATE (open button)
        if (e.target.classList.contains('add-product-btn')) {
            const categoryId = e.target.dataset.categoryId;
            document.getElementById('productModalTitle').textContent = 'Crear Nuevo Producto';
            productForm.reset();
            document.getElementById('productCategoryId').value = categoryId;
            document.getElementById('productId').value = '';
            productModal.style.display = 'block';
        }
    });

    // Initialize
    fetchCategoriesAndProducts();
});