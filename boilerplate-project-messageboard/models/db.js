const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./messageBoard.db");

db.serialize(() => {
	db.run(
		`CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      text TEXT, 
      delete_password TEXT, 
      board TEXT, 
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
      bumped_on TEXT DEFAULT CURRENT_TIMESTAMP, 
      reported BOOLEAN DEFAULT 0
    )`
	);

	db.run(
		`CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      thread_id INTEGER, 
      text TEXT, 
      delete_password TEXT, 
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
      reported BOOLEAN DEFAULT 0,
      FOREIGN KEY(thread_id) REFERENCES threads(id)
    )`
	);
});

module.exports = db;
