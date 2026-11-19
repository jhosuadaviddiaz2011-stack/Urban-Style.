
const express = require("express");

const app = express();

const PORT = 3000;

// PRODUCTOS DE URBAN STYLE

const productos = [
    {
        id: 1,
        nombre: "SUDADERA URBAN",
        precio: 120000,
        categoria: "sudaderas"
    },
    {
        id: 2,
        nombre: "CAMISETA STREET",
        precio: 65000,
        categoria: "camisetas"
    },
    {
        id: 3,
        nombre: "PANTALÓN BAGGY",
        precio: 150000,
        categoria: "pantalones"
    }
];

// RUTA PRINCIPAL

app.get("/", function(req, res) {
    res.send("¡Bienvenido al backend de URBAN STYLE!");
});

// API PARA CONSULTAR PRODUCTOS

app.get("/api/productos", function(req, res) {
    res.json(productos);
});

// ENCENDER SERVIDOR

app.listen(PORT, function() {
    console.log("Servidor funcionando en http://localhost:" + PORT);
});
