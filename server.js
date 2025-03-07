const express = require("express");
const helmet = require("helmet");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de seguridad (Tests 2, 3, 4)
app.use(
	helmet.frameguard({ action: "sameorigin" }), // iFrames solo en el mismo origen
	helmet.dnsPrefetchControl({ allow: false }), // Desactivar DNS prefetching
	helmet.referrerPolicy({ policy: "same-origin" }) // Política de referencias
);

// Rutas
const routes = require("./routes/api");
app.use("/api", routes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
