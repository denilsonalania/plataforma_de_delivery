document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('user-list');
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const closeBtn = document.querySelector('.close-btn');

    async function fetchUsers() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = await response.json();

            userList.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td>${user.celular || 'N/A'}</td>
                    <td>${user.rol}</td>
                    <td>${new Date(user.fecha_creacion).toLocaleDateString()}</td>
                    <td>
                        <button class="edit-btn" data-id="${user.id}">Editar Rol</button>
                        <button class="delete-btn" data-id="${user.id}">Eliminar</button>
                    </td>
                `;
                userList.appendChild(row);
            });

        } catch (error) {
            console.error('Error al obtener usuarios:', error);
        }
    }

    // Eventos del modal para editar y eliminar
    userList.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Lógica para el botón de "Editar Rol"
        if (e.target.classList.contains('edit-btn')) {
            const userId = e.target.dataset.id;
            try {
                const response = await fetch(`/api/usuarios/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = await response.json();

                document.getElementById('userId').value = user.id;
                document.getElementById('userRole').value = user.rol;
                document.getElementById('userName').textContent = user.nombre;
                document.getElementById('userEmail').textContent = user.correo;
                document.getElementById('userPhone').value = user.celular || '';

                userModal.style.display = 'block';
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
                alert('Error al obtener datos del usuario.');
            }
        }

        // Lógica para el botón de "Eliminar"
        if (e.target.classList.contains('delete-btn')) {
            const userId = e.target.dataset.id;
            if (confirm('¿Está seguro de que desea eliminar a este usuario?')) {
                try {
                    await fetch(`/api/usuarios/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    fetchUsers();
                } catch (error) {
                    console.error('Error al eliminar usuario:', error);
                    alert('Error al eliminar usuario.');
                }
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        userModal.style.display = 'none';
    });

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const newRole = document.getElementById('userRole').value;
        const newPhone = document.getElementById('userPhone').value;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/usuarios/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newRole, newPhone })
            });
            if (response.ok) {
                userModal.style.display = 'none';
                fetchUsers();
            } else {
                alert('Error al guardar los cambios.');
            }
        } catch (error) {
            console.error('Error al guardar cambios:', error);
            alert('Error al guardar los cambios.');
        }
    });

    fetchUsers();
});