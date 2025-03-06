// database.js
const sqlite3 = require("sqlite3").verbose();

// Conectar a la base de datos (crea el archivo si no existe)
const db = new sqlite3.Database("messageBoard.db");

// Crear tablas (ejecútalo una vez para inicializar)
db.serialize(() => {
	db.run(`
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board TEXT NOT NULL,
      text TEXT NOT NULL,
      created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      bumped_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delete_password TEXT NOT NULL,
      reported BOOLEAN DEFAULT 0
    );
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delete_password TEXT NOT NULL,
      reported BOOLEAN DEFAULT 0,
      FOREIGN KEY (thread_id) REFERENCES threads(id)
    );
  `);
});

// Exportar la conexión
module.exports = db;
