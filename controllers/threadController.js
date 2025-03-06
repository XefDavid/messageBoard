// controllers/threadController.js
// Este archivo se va a encargar de manejar las funciones de crear, eliminar , reportar y obtener los hilos de un tablero.

const db = require("../database");

// Creamos un nuevo hilo
exports.createThread = async (req, res) => {
	const { text, delete_password } = req.body;
	const board = req.params.board;

	if (!text || !delete_password || !board) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		const result = await new Promise((resolve, reject) => {
			db.run(
				"INSERT INTO threads (board, text, delete_password) VALUES (?, ?, ?)",
				[board, text, delete_password],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				}
			);
		});

		res.json({ message: "Thread created successfully", thread_id: result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

//Obtener los 10 hilos de un tablero mas recientes con ters respuestas cada uno

exports.getThreads = async (req, res) => {
	const board = req.params.board;

	const query = `
    SELECT * FROM threads
    WHERE board = ?
    ORDER BY bumped_on DESC
    LIMIT 10
  `;

	try {
		const threads = await new Promise((resolve, reject) => {
			db.all(query, [board], (err, rows) => {
				if (err) return reject(err);
				resolve(rows);
			});
		});

		res.json({ threads });
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// Eliminar un hilo
exports.deleteThread = async (req, res) => {
	const threadId = req.body.thread_id;
	const password = req.body.delete_password;
	const board = req.params.board;

	// Verificar existencia del hilo
	const queryCheck = `SELECT delete_password FROM threads WHERE id = ? AND board = ?`;

	try {
		const thread = await new Promise((resolve, reject) => {
			db.get(queryCheck, [threadId, board], (err, row) => {
				if (err) return reject(err);
				resolve(row);
			});
		});

		if (!thread) {
			return res.status(404).send("Thread not found");
		}

		if (password !== thread.delete_password) {
			return res.status(401).send("Incorrect password");
		}

		// Eliminar el hilo
		await new Promise((resolve, reject) => {
			db.run(`DELETE FROM threads WHERE id = ?`, [threadId], (err) => {
				if (err) return reject(err);
				resolve();
			});
		});

		res.send("Thread deleted successfully");
	} catch (error) {
		res.status(500).send(error.message);
	}
};
//Reportar un hilo

exports.reportThread = async (req, res) => {
	const threadId = req.body.thread_id;
	const board = req.params.board;

	const query = `
    UPDATE threads
    SET reported = 1
    WHERE id = ? AND board = ?
  `;

	try {
		await new Promise((resolve, reject) => {
			db.run(query, [threadId, board], function (err) {
				if (err) return reject(err);
				if (this.changes === 0) {
					return res.status(404).send("Thread not found");
				}
				resolve();
			});
		});

		res.send("Thread reported successfully");
	} catch (error) {
		res.status(500).send(error.message);
	}
};
