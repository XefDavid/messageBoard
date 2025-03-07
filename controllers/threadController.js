const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

// Crear un hilo
exports.createThread = async (req, res) => {
	const { text, delete_password } = req.body;
	const board = req.params.board;
	try {
		const now = new Date().toISOString();
		const threadId = await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO threads (board, text, created_on, bumped_on, delete_password, reported) 
         VALUES (?, ?, ?, ?, ?, ?)`,
				[board, text, now, now, delete_password, false],
				function (err) {
					err ? reject(err) : resolve(this.lastID);
				}
			);
		});
		res.json({
			_id: threadId,
			text,
			created_on: now,
			bumped_on: now,
			reported: false,
			delete_password,
			replies: [],
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Obtener los 10 hilos más recientes con las 3 últimas respuestas
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
				(err, rows) => (err ? reject(err) : resolve(rows))
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
					(err, rows) => (err ? reject(err) : resolve(rows))
				);
			});
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
				`SELECT delete_password FROM threads WHERE id = ?`,
				[thread_id],
				(err, row) => (err ? reject(err) : resolve(row))
			);
		});
		if (!thread || thread.delete_password !== delete_password) {
			return res.send("incorrect password");
		}
		await new Promise((resolve, reject) => {
			db.run(`DELETE FROM threads WHERE id = ?`, [thread_id], (err) =>
				err ? reject(err) : resolve()
			);
		});
		res.send("success");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Reportar un hilo
exports.reportThread = async (req, res) => {
	const { thread_id } = req.body;
	try {
		await new Promise((resolve, reject) => {
			db.run(
				`UPDATE threads SET reported = 1 WHERE id = ?`,
				[thread_id],
				(err) => (err ? reject(err) : resolve())
			);
		});
		res.send("reported");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
