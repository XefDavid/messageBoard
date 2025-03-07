const express = require("express");
const replyController = require("../controllers/replyController");

const router = express.Router();

// Ruta para crear una respuesta
router.post("/:board", replyController.createReply);

// Ruta para obtener respuestas de un thread
router.get("/:board", replyController.getReplies);

// Ruta para borrar una respuesta
router.delete("/:board", replyController.deleteReply);

// Ruta para reportar una respuesta
router.put("/:board", replyController.reportReply);

module.exports = router;
