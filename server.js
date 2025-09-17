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


// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- CÓDIGO DE DEPURACIÓN DE RUTAS ---
function printRoutes(app, routePath) {
  const routes = app._router.stack
    .filter(layer => layer.route)
    .map(layer => {
      return {
        path: layer.route.path,
        method: Object.keys(layer.route.methods).join(', ').toUpperCase()
      };
    });
  console.log(`\n--- Rutas registradas para '${routePath}' ---`);
  routes.forEach(route => console.log(`${route.method} ${routePath}${route.path}`));
  console.log('--- Fin de la lista de rutas ---');
}
// --- FIN DEL CÓDIGO DE DEPURACIÓN ---

// --- Rutas de la API ---
app.use('/api/restaurantes', restaurantRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', orderRoutes);
app.use('/api/rides', rideRoutes);


// --- Rutas de páginas HTML ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'index.html'));
});
app.get('/menu/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'restaurant_menu.html'));
});
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'cart.html'));
});
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'checkout.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'register.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'login.html'));
});
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
app.get('/request-ride', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'client', 'request_ride.html'));
});
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