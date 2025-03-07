const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

// Crear una respuesta
exports.createReply = async (req, res) => {
	const { text, delete_password, thread_id } = req.body;
	try {
		const now = new Date().toISOString();
		const replyId = await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO replies (thread_id, text, created_on, delete_password, reported) 
         VALUES (?, ?, ?, ?, ?)`,
				[thread_id, text, now, delete_password, false],
				function (err) {
					err ? reject(err) : resolve(this.lastID);
				}
			);
		});
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE threads SET bumped_on = ? WHERE id = ?`,
				[now, thread_id],
				(err) => (err ? reject(err) : resolve())
			);
		});
		res.json({
			_id: replyId,
			text,
			created_on: now,
			reported: false,
			delete_password,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Obtener todas las respuestas de un hilo
exports.getReplies = async (req, res) => {
	const { thread_id } = req.query;
	try {
		const thread = await new Promise((resolve, reject) => {
			db.get(
				`SELECT id AS _id, text, created_on, bumped_on 
         FROM threads 
         WHERE id = ?`,
				[thread_id],
				(err, row) => (err ? reject(err) : resolve(row))
			);
		});
		if (!thread) return res.status(404).send("Thread not found");
		const replies = await new Promise((resolve, reject) => {
			db.all(
				`SELECT id AS _id, text, created_on 
         FROM replies 
         WHERE thread_id = ? 
         ORDER BY created_on ASC`,
				[thread_id],
				(err, rows) => (err ? reject(err) : resolve(rows))
			);
		});
		res.json({
			...thread,
			replies,
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
				`SELECT delete_password FROM replies WHERE id = ?`,
				[reply_id],
				(err, row) => (err ? reject(err) : resolve(row))
			);
		});
		if (!reply || reply.delete_password !== delete_password) {
			return res.send("incorrect password");
		}
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE replies SET text = "[deleted]" WHERE id = ?`,
				[reply_id],
				(err) => (err ? reject(err) : resolve())
			);
		});
		res.send("success");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Reportar una respuesta
exports.reportReply = async (req, res) => {
	const { reply_id } = req.body;
	try {
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE replies SET reported = 1 WHERE id = ?`,
				[reply_id],
				(err) => (err ? reject(err) : resolve())
			);
		});
		res.send("reported");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
