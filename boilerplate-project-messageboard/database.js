const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Crear o abrir la base de datos SQLite
const db = new sqlite3.Database(
	path.join(__dirname, "messageboard.db"),
	(err) => {
		if (err) {
			console.error("Error al conectar a la base de datos", err.message);
		} else {
			console.log("Conectado a la base de datos SQLite");
		}
	}
);

// Crear las tablas necesarias si no existen
db.serialize(() => {
	db.run(`
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board TEXT NOT NULL,
      text TEXT NOT NULL,
      created_on TEXT,
      bumped_on TEXT
    )
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_on TEXT,
      reported BOOLEAN DEFAULT 0,
      FOREIGN KEY (thread_id) REFERENCES threads(id)
    )
  `);
});

module.exports = db;
