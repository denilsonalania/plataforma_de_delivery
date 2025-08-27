const mysql = require('mysql2');

// Crea un pool de conexiones para manejar múltiples conexiones
const pool = mysql.createPool({
  host: 'localhost', // O la IP de tu servidor de base de datos
  user: 'root',      // Tu nombre de usuario de MySQL
  password: 'denis74687206', // Tu contraseña de MySQL
  database: 'delivery_app', // Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exporta el pool para que pueda ser utilizado en los modelos
module.exports = pool.promise();

console.log('Conexión a la base de datos establecida.');