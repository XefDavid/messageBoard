const db = require("../models/db");

exports.createReply = (req, res) => {
	const { board } = req.params;
	const { text, delete_password, thread_id } = req.body;

	if (!text || !delete_password || !thread_id) {
		return res.status(400).json({ error: "Todos los campos son obligatorios" });
	}

	const createdAt = new Date().toISOString();

	// Insertar la respuesta en la base de datos
	db.run(
		`INSERT INTO replies (thread_id, text, delete_password, created_at, reported) 
     VALUES (?, ?, ?, ?, 0)`,
		[thread_id, text, delete_password, createdAt],
		function (err) {
			if (err) {
				return res.status(500).json({ error: err.message });
			}

			// Actualizar bumped_on en el thread correspondiente
			db.run(
				`UPDATE threads SET bumped_on = ? WHERE id = ?`,
				[createdAt, thread_id],
				(err) => {
					if (err) {
						return res.status(500).json({ error: err.message });
					}
					res.json({ success: "Reply added successfully" });
				}
			);
		}
	);
};

exports.getReplies = (req, res) => {
	const { board } = req.params;
	const { thread_id } = req.query;

	db.get(
		`SELECT id, text, created_at, bumped_on 
     FROM threads 
     WHERE id = ? AND board = ?`,
		[thread_id, board],
		(err, thread) => {
			if (err || !thread) {
				return res.status(404).json({ error: "Thread no encontrado" });
			}

			db.all(
				`SELECT id, text, created_at 
         FROM replies 
         WHERE thread_id = ? 
         ORDER BY created_at ASC`,
				[thread_id],
				(err, replies) => {
					if (err) {
						return res.status(500).json({ error: err.message });
					}

					thread.replies = replies;
					res.json(thread);
				}
			);
		}
	);
};

exports.reportReply = (req, res) => {
	const reply_id = req.body.reply_id;
	db.run("UPDATE replies SET reported = 1 WHERE id = ?", [reply_id], (err) => {
		if (err) {
			return res.status(500).send("Error al reportar la respuesta.");
		}
		res.status(200).send("Respuesta reportada.");
	});
};

exports.deleteReply = (req, res) => {
	const reply_id = req.body.reply_id;
	db.run("DELETE FROM replies WHERE id = ?", [reply_id], (err) => {
		if (err) {
			return res.status(500).send("Error al eliminar la respuesta.");
		}
		res.status(200).send("Respuesta eliminada.");
	});
};
