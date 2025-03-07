const Thread = require("../models/thread");

const threadController = {
	getThreads: (req, res) => {
		const { board } = req.params;
		Thread.find({ board })
			.sort({ bumped_on: -1 })
			.limit(10)
			.then((threads) => {
				res.json(threads);
			})
			.catch((err) =>
				res.status(500).json({ error: "Error al obtener los hilos." })
			);
	},

	createThread: (req, res) => {
		const { board } = req.params;
		const { text, delete_password } = req.body;

		const newThread = new Thread({
			board,
			text,
			delete_password,
			created_on: new Date(),
			bumped_on: new Date(),
			reported: false,
			replies: [],
		});

		newThread
			.save()
			.then(() => res.status(201).json(newThread))
			.catch((err) =>
				res.status(500).json({ error: "Error al crear el hilo." })
			);
	},

	reportThread: (req, res) => {
		const { board, thread_id } = req.params;
		Thread.findByIdAndUpdate(thread_id, { reported: true }, { new: true })
			.then(() => res.json("reported"))
			.catch((err) =>
				res.status(500).json({ error: "Error al reportar el hilo." })
			);
	},

	deleteThread: (req, res) => {
		const { board, thread_id } = req.params;
		const { delete_password } = req.body;

		Thread.findById(thread_id)
			.then((thread) => {
				if (thread.delete_password === delete_password) {
					thread
						.remove()
						.then(() => res.json("success"))
						.catch((err) =>
							res.status(500).json({ error: "Error al eliminar el hilo." })
						);
				} else {
					res.status(400).json("incorrect password");
				}
			})
			.catch((err) =>
				res.status(500).json({ error: "Error al encontrar el hilo." })
			);
	},
};

module.exports = threadController;
