const db = require("../database");

exports.createThread = async (req, res) => {
	const { text, delete_password } = req.body;
	const board = req.params.board;

	try {
		const created_on = new Date().toISOString();
		const bumped_on = created_on;

		const threadId = await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO threads (board, text, created_on, bumped_on, delete_password) 
         VALUES (?, ?, ?, ?, ?)`,
				[board, text, created_on, bumped_on, delete_password],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				}
			);
		});

		res.json({
			_id: threadId,
			text,
			created_on,
			bumped_on,
			replies: [], // Sin campos sensibles
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getThreads = async (req, res) => {
	const board = req.params.board;

	try {
		const threads = await new Promise((resolve, reject) => {
			db.all(
				`SELECT id AS _id, text, created_on, bumped_on 
         FROM threads 
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

		for (const thread of threads) {
			thread.replies = await new Promise((resolve, reject) => {
				db.all(
					`SELECT id AS _id, text, created_on 
           FROM replies 
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
		}

		res.json(threads);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.deleteThread = async (req, res) => {
	const { thread_id, delete_password } = req.body;

	try {
		// Verificar contraseña
		const thread = await new Promise((resolve, reject) => {
			db.get(
				`SELECT delete_password 
         FROM threads 
         WHERE id = ?`,
				[thread_id],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				}
			);
		});

		if (!thread || thread.delete_password !== delete_password) {
			return res.send("incorrect password");
		}

		// Eliminar respuestas asociadas
		await new Promise((resolve, reject) => {
			db.run(`DELETE FROM replies WHERE thread_id = ?`, [thread_id], (err) => {
				if (err) reject(err);
				resolve();
			});
		});

		// Eliminar hilo
		await new Promise((resolve, reject) => {
			db.run(`DELETE FROM threads WHERE id = ?`, [thread_id], (err) => {
				if (err) reject(err);
				resolve();
			});
		});

		res.send("success");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.reportThread = async (req, res) => {
	const { thread_id } = req.body;

	try {
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE threads SET reported = 1 WHERE id = ?`,
				[thread_id],
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
