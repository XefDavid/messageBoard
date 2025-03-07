const db = require("../database");

exports.createReply = async (req, res) => {
	const { text, delete_password, thread_id } = req.body;
	const board = req.params.board;

	try {
		const created_on = new Date().toISOString();

		// Insertar respuesta
		const replyId = await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO replies (thread_id, text, created_on, delete_password) 
         VALUES (?, ?, ?, ?)`,
				[thread_id, text, created_on, delete_password],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				}
			);
		});

		// Actualizar bumped_on del hilo
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE threads 
         SET bumped_on = ? 
         WHERE id = ?`,
				[created_on, thread_id],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		res.json({
			_id: replyId,
			text,
			created_on,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getReplies = async (req, res) => {
	const { thread_id } = req.query;

	try {
		const thread = await new Promise((resolve, reject) => {
			db.get(
				`SELECT id AS _id, text, created_on, bumped_on 
         FROM threads 
         WHERE id = ?`,
				[thread_id],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				}
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
				(err, rows) => {
					if (err) reject(err);
					resolve(rows);
				}
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

exports.deleteReply = async (req, res) => {
	const { thread_id, reply_id, delete_password } = req.body;

	try {
		// Verificar contraseña
		const reply = await new Promise((resolve, reject) => {
			db.get(
				`SELECT delete_password 
         FROM replies 
         WHERE id = ? AND thread_id = ?`,
				[reply_id, thread_id],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				}
			);
		});

		if (!reply || reply.delete_password !== delete_password) {
			return res.send("incorrect password");
		}

		// Marcar como eliminado
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE replies 
         SET text = '[deleted]' 
         WHERE id = ?`,
				[reply_id],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		res.send("success");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.reportReply = async (req, res) => {
	const { thread_id, reply_id } = req.body;

	try {
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE replies 
         SET reported = 1 
         WHERE id = ? AND thread_id = ?`,
				[reply_id, thread_id],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		res.send("reported");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
