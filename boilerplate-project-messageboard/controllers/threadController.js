const db = require("../database");

exports.getThreads = (req, res) => {
	const board = req.params.board;
	db.all("SELECT * FROM threads WHERE board = ?", [board], (err, rows) => {
		if (err) {
			return res.status(500).send("Error al obtener los hilos.");
		}
		res.json(rows);
	});
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
