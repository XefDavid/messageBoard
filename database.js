const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
	// Crear tabla de hilos
	db.run(`
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board TEXT NOT NULL,
      text TEXT NOT NULL,
      created_on TEXT NOT NULL,
      bumped_on TEXT NOT NULL,
      delete_password TEXT NOT NULL,
      reported BOOLEAN DEFAULT false
    )
  `);

	// Crear tabla de respuestas
	db.run(`
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_on TEXT NOT NULL,
      delete_password TEXT NOT NULL,
      reported BOOLEAN DEFAULT false,
      FOREIGN KEY (thread_id) REFERENCES threads(id)
    )
  `);
});

module.exports = db;
