// controllers/replyController.js
const db = require("../database"); // Conexión a la base de datos SQLite3

// Crear una nueva respuesta
exports.createReply = async (req, res) => {
	const { text, delete_password, thread_id } = req.body;
	const board = req.params.board;

	if (!text || !delete_password || !thread_id) {
		return res.status(400).send("Missing required fields");
	}

	try {
		const created_on = new Date().toISOString();

		const replyId = await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO replies (thread_id, text, created_on, delete_password, reported) 
                 VALUES (?, ?, ?, ?, ?)`,
				[thread_id, text, created_on, delete_password, false],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				}
			);
		});

		// 🔥 Actualizar `bumped_on` en la tabla `threads`
		await new Promise((resolve, reject) => {
			db.run(
				"UPDATE threads SET bumped_on = ? WHERE id = ?",
				[created_on, thread_id],
				function (err) {
					if (err) reject(err);
					resolve();
				}
			);
		});

		// Enviar la respuesta con TODAS las propiedades requeridas
		res.json({
			_id: replyId,
			text,
			created_on,
			delete_password,
			reported: false,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Eliminar una respuesta
exports.deleteReply = async (req, res) => {
	const { thread_id, reply_id, delete_password } = req.body;

	try {
		const reply = await new Promise((resolve, reject) => {
			db.get(
				"SELECT delete_password FROM replies WHERE id = ? AND thread_id = ?",
				[reply_id, thread_id],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				}
			);
		});

		if (!reply) {
			return res.status(404).send("Reply not found");
		}

		// 🔥 Si la contraseña es incorrecta, enviar "incorrect password"
		if (reply.delete_password !== delete_password) {
			return res.send("incorrect password");
		}

		// 🔥 Cambiar el texto del reply a "[deleted]" en vez de eliminarlo
		await new Promise((resolve, reject) => {
			db.run(
				"UPDATE replies SET text = '[deleted]' WHERE id = ?",
				[reply_id],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		res.send("success");
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// Reportar una respuesta
exports.reportReply = async (req, res) => {
	const { reply_id } = req.body;

	try {
		await new Promise((resolve, reject) => {
			db.run(
				"UPDATE replies SET reported = 1 WHERE id = ?",
				[reply_id],
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

exports.getReplies = async (req, res) => {
	const thread_id = req.query.thread_id;

	try {
		const thread = await new Promise((resolve, reject) => {
			db.get(
				`SELECT id AS _id, text, created_on, bumped_on FROM threads WHERE id = ?`,
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

		// 🔥 Asegurar que `delete_password` y `reported` NO estén en la respuesta
		const replies = await new Promise((resolve, reject) => {
			db.all(
				`SELECT id AS _id, text, created_on FROM replies WHERE thread_id = ? ORDER BY created_on ASC`,
				[thread_id],
				(err, rows) => {
					if (err) reject(err);
					resolve(rows);
				}
			);
		});

		thread.replies = replies;
		res.json(thread);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
