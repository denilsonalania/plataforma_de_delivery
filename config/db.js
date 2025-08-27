const { Pool } = require('pg');

// La URL de conexión se obtiene de las variables de entorno de Render
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Conexión a la base de datos establecida.');

// Exporta el pool para que pueda ser utilizado en los modelos
module.exports = db;