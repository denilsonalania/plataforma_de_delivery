const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const restaurantRoutes = require('./routes/restaurantRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rideRoutes = require('./routes/rideRoutes');
const addressRoutes = require('./routes/addressRoutes');

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Conexión a la base de datos ---
// La conexión ahora se maneja directamente con el pool,
// no necesitas una llamada explícita a getConnection() aquí.
// El error de "Unknown column" ya se solucionó en la base de datos.

// --- Rutas de la API ---
app.use('/api/restaurantes', restaurantRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', orderRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/addresses', addressRoutes);

// --- Rutas de páginas HTML ---
// Ruta para la página de inicio (cliente)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'index.html'));
});
// Ruta para la página del menú de un restaurante
app.get('/menu/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'restaurant_menu.html'));
});
// Ruta para la página del carrito
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'cart.html'));
});
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'checkout.html'));
});
// Ruta para la página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'register.html'));
});
// Ruta para la página de inicio de sesión
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'login.html'));
});
// Rutas del Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'business_management.html'));
});

app.get('/dashboard/negocios', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'business_management.html'));
});

app.get('/dashboard/menu/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'product_management.html'));
});

app.get('/dashboard/usuarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'user_management.html'));
});
app.get('/dashboard/pedidos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'order_management.html'));

});
app.get('/dashboard/motorizado', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'motorizado_dashboard.html'));
});
// Ruta para la página de solicitud de viaje
app.get('/request-ride', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'request_ride.html'));
});
// Añade esta nueva ruta:
app.get('/dashboard/conductor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'conductor_dashboard.html'));
});
app.get('/dashboard/viajes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'ride_management.html'));
});

// --- Iniciar el servidor ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});