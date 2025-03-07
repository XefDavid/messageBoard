// controllers/threadController.js
// Este archivo se va a encargar de manejar las funciones de crear, eliminar , reportar y obtener los hilos de un tablero.

const db = require("../database");

exports.createThread = async (req, res) => {
	const { text, delete_password } = req.body;
	const board = req.params.board;

	if (!text || !delete_password || !board) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		const created_on = new Date().toISOString();
		const bumped_on = created_on;

		const result = await new Promise((resolve, reject) => {
			db.run(
				"INSERT INTO threads (board, text, created_on, bumped_on, delete_password, reported) VALUES (?, ?, ?, ?, ?, ?)",
				[board, text, created_on, bumped_on, delete_password, false],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				}
			);
		});

		res.json({
			_id: result,
			text,
			created_on,
			bumped_on,
			reported: false,
			replies: [],
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

//Obtener los 10 hilos de un tablero mas recientes con ters respuestas cada uno

exports.getThreads = async (req, res) => {
	const board = req.params.board;

	try {
		const threads = await new Promise((resolve, reject) => {
			db.all(
				`SELECT id AS _id, text, created_on, bumped_on FROM threads 
                WHERE board = ? 
                ORDER BY bumped_on DESC 
                LIMIT 10`,
				[board],
				(err, rows) => {
					if (err) reject(err);
					resolve(rows);
				}
			);
		});

		for (let thread of threads) {
			const replies = await new Promise((resolve, reject) => {
				db.all(
					`SELECT id AS _id, text, created_on FROM replies 
                    WHERE thread_id = ? 
                    ORDER BY created_on DESC 
                    LIMIT 3`,
					[thread._id],
					(err, rows) => {
						if (err) reject(err);
						resolve(rows);
					}
				);
			});

			thread.replies = replies;
		}

		res.json(threads);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Eliminar un hilo
exports.deleteThread = async (req, res) => {
	const { thread_id, delete_password } = req.body;

	try {
		const thread = await new Promise((resolve, reject) => {
			db.get(
				"SELECT delete_password FROM threads WHERE id = ?",
				[thread_id],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				}
			);
		});

		if (!thread) {
			return res.status(404).send("Thread not found");
		}

		// 🔥 Verificar si la contraseña es incorrecta
		if (thread.delete_password !== delete_password) {
			return res.send("incorrect password");
		}

		// Eliminar el thread
		await new Promise((resolve, reject) => {
			db.run("DELETE FROM threads WHERE id = ?", [thread_id], (err) => {
				if (err) reject(err);
				resolve();
			});
		});

		res.send("success");
	} catch (error) {
		res.status(500).send(error.message);
	}
};

//Reportar un hilo

exports.reportThread = async (req, res) => {
	const { thread_id } = req.body;

	try {
		await new Promise((resolve, reject) => {
			db.run(
				"UPDATE threads SET reported = 1 WHERE id = ?",
				[thread_id],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		res.send("reported");
	} catch (error) {
		res.status(500).send(error.message);
	}
};
