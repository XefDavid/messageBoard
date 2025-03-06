"use strict";
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");
const apiRoutes = require("./routes/api");

const app = express();

// Configuración básica
app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({ origin: "*" })); // Para pruebas de FCC

// Middleware
app.use(helmet());
app.use(xss()); // Protección contra XSS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de la API
app.use("/api", apiRoutes); // Monta las rutas de '/api'

// Rutas estáticas
app.get("/b/:board/", (req, res) => {
	res.sendFile(process.cwd() + "/views/board.html");
});
app.get("/b/:board/:threadid", (req, res) => {
	res.sendFile(process.cwd() + "/views/thread.html");
});

// Página principal
app.get("/", (req, res) => {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Rutas de pruebas de FCC
fccTestingRoutes(app);

// Middleware 404
app.use((req, res, next) => {
	res.status(404).type("text").send("Not Found");
});

// Iniciar el servidor
const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Server running on port", listener.address().port);
	if (process.env.NODE_ENV === "test") {
		console.log("Running Tests...");
		setTimeout(() => {
			try {
				runner.run();
			} catch (e) {
				console.error("Tests failed:", e);
			}
		}, 1500);
	}
});

module.exports = app; // Para pruebas
