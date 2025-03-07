const Reply = require("../models/reply");

const replyController = {
	createReply: (req, res) => {
		const { board } = req.params;
		const { text, delete_password, thread_id } = req.body;

		const newReply = new Reply({
			thread_id,
			text,
			delete_password,
			created_on: new Date(),
			reported: false,
		});

		newReply
			.save()
			.then(() => {
				// Actualizar el campo bumped_on del hilo
				Thread.findByIdAndUpdate(thread_id, { bumped_on: new Date() })
					.then(() => res.status(201).json(newReply))
					.catch((err) =>
						res.status(500).json({ error: "Error al actualizar el hilo." })
					);
			})
			.catch((err) =>
				res.status(500).json({ error: "Error al crear la respuesta." })
			);
	},

	getReplies: (req, res) => {
		const { board } = req.params;
		const { thread_id } = req.query;

		Reply.find({ thread_id })
			.then((replies) => res.json(replies))
			.catch((err) =>
				res.status(500).json({ error: "Error al obtener las respuestas." })
			);
	},

	reportReply: (req, res) => {
		const { board, reply_id } = req.params;
		Reply.findByIdAndUpdate(reply_id, { reported: true }, { new: true })
			.then(() => res.json("reported"))
			.catch((err) =>
				res.status(500).json({ error: "Error al reportar la respuesta." })
			);
	},

	deleteReply: (req, res) => {
		const { board, reply_id } = req.params;
		const { delete_password } = req.body;

		Reply.findById(reply_id)
			.then((reply) => {
				if (reply.delete_password === delete_password) {
					reply.text = "[deleted]";
					reply
						.save()
						.then(() => res.json("success"))
						.catch((err) =>
							res.status(500).json({ error: "Error al eliminar la respuesta." })
						);
				} else {
					res.status(400).json("incorrect password");
				}
			})
			.catch((err) =>
				res.status(500).json({ error: "Error al encontrar la respuesta." })
			);
	},
};

module.exports = replyController;
