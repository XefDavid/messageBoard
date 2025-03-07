const db = require("../database");

exports.createReply = (req, res) => {
	const { thread_id, text } = req.body;
	const created_on = new Date().toISOString();

	db.run(
		"INSERT INTO replies (thread_id, text, created_on) VALUES (?, ?, ?)",
		[thread_id, text, created_on],
		function (err) {
			if (err) {
				return res.status(500).send("Error al crear la respuesta.");
			}
			res.status(201).json({
				id: this.lastID,
				thread_id,
				text,
				created_on,
			});
		}
	);
};

exports.getReplies = (req, res) => {
	const thread_id = req.params.thread_id;
	db.all(
		"SELECT * FROM replies WHERE thread_id = ?",
		[thread_id],
		(err, rows) => {
			if (err) {
				return res.status(500).send("Error al obtener las respuestas.");
			}
			res.json(rows);
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
