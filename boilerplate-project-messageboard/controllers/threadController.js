const db = require("../database");

exports.getThreads = (req, res) => {
	const { board } = req.params;

	db.all(
		`SELECT id, text, created_at, bumped_on 
     FROM threads 
     WHERE board = ? 
     ORDER BY bumped_on DESC 
     LIMIT 10`,
		[board],
		(err, threads) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}

			// Obtener las respuestas de cada thread
			const threadIds = threads.map((t) => t.id);
			if (threadIds.length === 0) return res.json([]);

			db.all(
				`SELECT id, thread_id, text, created_at 
         FROM replies 
         WHERE thread_id IN (${threadIds.join(",")}) 
         ORDER BY created_at DESC`,
				[],
				(err, replies) => {
					if (err) {
						return res.status(500).json({ error: err.message });
					}

					// Agrupar las respuestas en cada thread (máximo 3 por thread)
					threads.forEach((thread) => {
						thread.replies = replies
							.filter((r) => r.thread_id === thread.id)
							.slice(0, 3);
					});

					res.json(threads);
				}
			);
		}
	);
};

exports.createThread = (req, res) => {
	const { text } = req.body;
	const board = req.params.board;
	const created_on = new Date().toISOString();
	const bumped_on = new Date().toISOString();

	db.run(
		"INSERT INTO threads (board, text, created_on, bumped_on) VALUES (?, ?, ?, ?)",
		[board, text, created_on, bumped_on],
		function (err) {
			if (err) {
				return res.status(500).send("Error al crear el hilo.");
			}
			res.status(201).json({
				id: this.lastID,
				board,
				text,
				created_on,
				bumped_on,
			});
		}
	);
};

exports.reportThread = (req, res) => {
	const thread_id = req.body.thread_id;
	db.run("UPDATE threads SET reported = 1 WHERE id = ?", [thread_id], (err) => {
		if (err) {
			return res.status(500).send("Error al reportar el hilo.");
		}
		res.status(200).send("Hilo reportado.");
	});
};

exports.deleteThread = (req, res) => {
	const thread_id = req.body.thread_id;
	db.run("DELETE FROM threads WHERE id = ?", [thread_id], (err) => {
		if (err) {
			return res.status(500).send("Error al eliminar el hilo.");
		}
		res.status(200).send("Hilo eliminado.");
	});
};
