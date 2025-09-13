document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: name, correo: email, contrasena: password, celular: phone, rol: 'cliente' })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
                    window.location.href = '/login';
                } else {
                    alert(`Error en el registro: ${data.error}`);
                }
            } catch (error) {
                console.error('Error al registrarse:', error);
                alert('Error al registrarse. Intente de nuevo.');
            }
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: email, contrasena: password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);

                    const decodedToken = jwt_decode(data.token);
                    const userRole = decodedToken.rol;

                    if (userRole === 'dueño' || userRole === 'admin') {
                        window.location.href = '/dashboard';
                    } else if (userRole === 'repartidor') {
                        window.location.href = '/dashboard/motorizado';
                     } else if (userRole === 'conductor') {
                        window.location.href = '/dashboard/conductor';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    alert(`Error en el inicio de sesión: ${data.error}`);
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error al iniciar sesión. Intente de nuevo.');
            }
        });
    }
});