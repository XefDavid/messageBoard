// routes/api.js
const express = require("express");
const router = express.Router();

// Importar controladores
const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

console.log("threadController:", threadController); // Verificar importaciones
console.log("replyController:", replyController);
// Rutas para hilos (threads)
router.post("/threads/:board", threadController.createThread);
router.get("/threads/:board", threadController.getThreads);
router.delete("/threads/:board", threadController.deleteThread);
router.put("/threads/:board", threadController.reportThread);

// Rutas para respuestas (replies)
router.post("/replies/:board", replyController.createReply);
router.get("/replies/:board", async (req, res) => {
	// Implementar esta ruta para obtener un hilo con todas las respuestas
	const board = req.params.board;
	const threadId = req.query.thread_id; // Necesitas el ID del hilo

	if (!threadId) {
		return res.status(400).send("Missing thread_id parameter");
	}

	try {
		// Obtener el hilo
		const thread = await new Promise((resolve, reject) => {
			db.get(
				"SELECT * FROM threads WHERE id = ? AND board = ?",
				[threadId, board],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				}
			);
		});

		if (!thread) {
			return res.status(404).send("Thread not found");
		}

		// Obtener todas las respuestas del hilo
		const replies = await new Promise((resolve, reject) => {
			db.all(
				"SELECT * FROM replies WHERE thread_id = ? ORDER BY created_on DESC",
				[threadId],
				(err, rows) => {
					if (err) reject(err);
					resolve(rows);
				}
			);
		});

		res.json({ thread, replies });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.delete("/replies/:board", replyController.deleteReply);
router.put("/replies/:board", replyController.reportReply);

module.exports = router;
