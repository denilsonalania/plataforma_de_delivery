const mysql = require('mysql2/promise');

// La URL de conexión se obtiene de las variables de entorno de Render
const db = mysql.createPool(process.env.DATABASE_URL);

console.log('Conexión a la base de datos establecida.');

// Exporta el pool para que pueda ser utilizado en los modelos
module.exports = db;