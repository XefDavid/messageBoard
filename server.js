const express = require("express");
const helmet = require("helmet");
const app = express();
const routes = require("./routes/api");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de seguridad con Helmet
app.use(
	helmet.frameguard({ action: "sameorigin" }), // Test 2
	helmet.dnsPrefetchControl({ allow: false }), // Test 3
	helmet.referrerPolicy({ policy: "same-origin" }) // Test 4
);

// Rutas
app.use("/api", routes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
