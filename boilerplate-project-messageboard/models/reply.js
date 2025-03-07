const mongoose = require("mongoose");

// Esquema para una respuesta
const replySchema = new mongoose.Schema({
	thread_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Thread",
		required: true,
	},
	text: { type: String, required: true },
	delete_password: { type: String, required: true },
	created_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false },
});

// Crear el modelo
const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
