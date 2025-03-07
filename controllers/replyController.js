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
				"INSERT INTO replies (thread_id, text, created_on, delete_password, reported) VALUES (?, ?, ?, ?, ?)",
				[thread_id, text, created_on, delete_password, false],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				}
			);
		});

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
	const { reply_id, delete_password } = req.body;

	// Verificar existencia de la respuesta
	const queryCheckReply = `
    SELECT delete_password FROM replies WHERE id = ?
  `;

	try {
		const reply = await new Promise((resolve, reject) => {
			db.get(queryCheckReply, [reply_id], (err, row) => {
				if (err) return reject(err);
				resolve(row);
			});
		});

		if (!reply) {
			return res.status(404).send("Reply not found");
		}

		if (reply.delete_password !== delete_password) {
			return res.status(401).send("Incorrect password");
		}

		// Actualizar la respuesta a "[deleted]" en lugar de eliminarla
		const queryUpdateReply = `
      UPDATE replies
      SET text = '[deleted]'
      WHERE id = ?
    `;

		await new Promise((resolve, reject) => {
			db.run(queryUpdateReply, [reply_id], (err) => {
				if (err) return reject(err);
				resolve();
			});
		});

		res.send("Reply deleted successfully");
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// Reportar una respuesta
exports.reportReply = async (req, res) => {
	const { reply_id } = req.body;

	const queryCheckReply = `
    SELECT * FROM replies WHERE id = ?
  `;

	try {
		// Verificar si la respuesta existe
		const reply = await new Promise((resolve, reject) => {
			db.get(queryCheckReply, [reply_id], (err, row) => {
				if (err) return reject(err);
				resolve(row);
			});
		});

		if (!reply) {
			return res.status(404).send("Reply not found");
		}

		// Marcar la respuesta como reportada
		const queryUpdateReport = `
      UPDATE replies
      SET reported = 1
      WHERE id = ?
    `;

		await new Promise((resolve, reject) => {
			db.run(queryUpdateReport, [reply_id], (err) => {
				if (err) return reject(err);
				resolve();
			});
		});

		res.send("Reply reported successfully");
	} catch (error) {
		res.status(500).send(error.message);
	}
};
exports.getReplies = async (req, res) => {
	const thread_id = req.query.thread_id;

	try {
		const thread = await new Promise((resolve, reject) => {
			db.get(
				`SELECT id, text, created_on, bumped_on FROM threads WHERE id = ?`,
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

		const replies = await new Promise((resolve, reject) => {
			db.all(
				`SELECT id, text, created_on FROM replies WHERE thread_id = ? ORDER BY created_on ASC`,
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
