const express = require("express");
const router = express.Router();
const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

// Rutas para los hilos
router
	.route("/threads/:board")
	.get(threadController.getThreads) // Obtener los hilos
	.post(threadController.createThread); // Crear un nuevo hilo

router
	.route("/threads/:board/:thread_id") // Especificar un thread_id para las operaciones PUT y DELETE
	.put(threadController.reportThread) // Reportar un hilo
	.delete(threadController.deleteThread); // Eliminar un hilo

// Rutas para las respuestas
router
	.route("/replies/:board")
	.post(replyController.createReply) // Crear una respuesta
	.get(replyController.getReplies); // Obtener respuestas

router
	.route("/replies/:board/:reply_id") // Especificar un reply_id para las operaciones PUT y DELETE
	.put(replyController.reportReply) // Reportar una respuesta
	.delete(replyController.deleteReply); // Eliminar una respuesta

module.exports = router;
