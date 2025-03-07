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
router.delete("/replies/:board", replyController.deleteReply);
router.put("/replies/:board", replyController.reportReply);

module.exports = router;
