const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const threadRoutes = require("./routes/api"); // Cambié apiRoutes a threadRoutes
const replyRoutes = require("./routes/replyRoutes");

const app = express();
const db = new sqlite3.Database("./database.sqlite");

// Middleware de seguridad con Helmet
app.use(
	helmet({
		frameguard: { action: "sameorigin" }, // No permite iFrames externos
		dnsPrefetchControl: { allow: false }, // Bloquea DNS prefetching
		referrerPolicy: { policy: "same-origin" }, // Solo envía referrer a páginas del mismo dominio
	})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use("/api/threads", threadRoutes);
app.use("/api/replies", replyRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
	console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
