const express = require("express");
const router = express.Router();
const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

// Asegúrate de que estas funciones existan y estén exportadas correctamente en los controladores.
router
	.route("/threads/:board")
	.get(threadController.getThreads)
	.post(threadController.createThread);

router.route("/threads/report").put(threadController.reportThread);

router.route("/threads/delete").delete(threadController.deleteThread);

router
	.route("/replies/:thread_id")
	.post(replyController.createReply)
	.get(replyController.getReplies);

router.route("/replies/report").put(replyController.reportReply);

router.route("/replies/delete").delete(replyController.deleteReply);

module.exports = router;
