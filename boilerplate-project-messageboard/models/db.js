// models/db.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./messageBoard.db"); // Archivo de base de datos SQLite

// Crear tablas si no existen
db.serialize(() => {
	db.run(
		"CREATE TABLE IF NOT EXISTS threads (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, delete_password TEXT, board TEXT, created_at TEXT, reported BOOLEAN)"
	);
	db.run(
		"CREATE TABLE IF NOT EXISTS replies (id INTEGER PRIMARY KEY AUTOINCREMENT, thread_id INTEGER, text TEXT, delete_password TEXT, created_at TEXT, reported BOOLEAN, FOREIGN KEY(thread_id) REFERENCES threads(id))"
	);
});

module.exports = db;
