// controllers/replyController.js
const db = require("../database"); // Conexión a la base de datos SQLite3

// Crear una nueva respuesta
exports.createReply = async (req, res) => {
	const { text, delete_password, thread_id } = req.body;

	if (!text || !delete_password || !thread_id) {
		return res
			.status(400)
			.send("Missing required fields (text, delete_password, thread_id)");
	}

	const queryInsertReply = `
    INSERT INTO replies (thread_id, text, delete_password)
    VALUES (?, ?, ?)
  `;

	try {
		// Insertar la nueva respuesta en la base de datos
		await new Promise((resolve, reject) => {
			db.run(
				queryInsertReply,
				[thread_id, text, delete_password],
				function (err) {
					if (err) return reject(err);
					resolve(this.lastID);
				}
			);
		});

		// Actualizar el hilo para que su campo 'bumped_on' refleje la fecha actual
		const queryUpdateThread = `
      UPDATE threads
      SET bumped_on = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

		await new Promise((resolve, reject) => {
			db.run(queryUpdateThread, [thread_id], (err) => {
				if (err) return reject(err);
				resolve();
			});
		});

		res.json({
			message: "Reply created successfully",
			reply_id: this.lastID,
		});
	} catch (error) {
		res.status(500).send(error.message);
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
