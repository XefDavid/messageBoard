const express = require("express");
const path = require("path");
const helmet = require("helmet");

const app = express();

app.use(
	helmet({
		frameguard: { action: "sameorigin" }, // Solo permitir iFrames en tu propio sitio (Punto 2)
		dnsPrefetchControl: { allow: false }, // Deshabilitar prefetching de DNS (Punto 3)
		referrerPolicy: { policy: "same-origin" }, // Solo enviar referrer en tu propio sitio (Punto 4)
	})
);
// Servir archivos estáticos desde "public" si tienes CSS o imágenes
app.use(express.static(path.join(__dirname, "public")));

// Servir index.html cuando visiten "/"
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Si tienes más rutas para otras páginas
app.get("/board", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "board.html"));
});

app.get("/thread", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "thread.html"));
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
