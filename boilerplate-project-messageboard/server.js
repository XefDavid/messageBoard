const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");

app.use(bodyParser.json()); // Usar bodyParser para manejar datos JSON
app.use(bodyParser.urlencoded({ extended: true })); // Para poder manejar datos de formularios

app.use("/api", apiRoutes); // Usar las rutas que definimos en api.js

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Servidor corriendo en el puerto ${PORT}`);
});
