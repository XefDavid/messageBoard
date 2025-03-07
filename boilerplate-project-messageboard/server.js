const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const threadRoutes = require("./routes/api");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Seguridad
app.use((req, res, next) => {
	res.setHeader("X-Frame-Options", "SAMEORIGIN");
	res.setHeader("X-DNS-Prefetch-Control", "off");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	next();
});

// Conectar a MongoDB (asegúrate de agregar tu URL de conexión)
mongoose.connect("mongodb://localhost/messageBoard", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Rutas
app.use("/api", threadRoutes);

// Servir la app en el puerto 3000
app.listen(3000, () => {
	console.log("Servidor corriendo en http://localhost:3000");
});
