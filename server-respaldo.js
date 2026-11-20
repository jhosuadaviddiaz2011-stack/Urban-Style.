
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.static(__dirname));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ]
}));

// =====================================
// 1. BASE DE DATOS
// =====================================

const db = new Database("urbanstyle.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        categoria TEXT NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_cliente TEXT NOT NULL,
        correo TEXT NOT NULL,
        direccion TEXT NOT NULL,
        productos TEXT NOT NULL,
        total REAL NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS administradores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

// =====================================
// 2. ACTUALIZAR TABLA DE PRODUCTOS
// =====================================

const columnas = db.prepare(
    "PRAGMA table_info(productos)"
).all().map(columna => columna.name);

if (!columnas.includes("descripcion")) {
    db.exec("ALTER TABLE productos ADD COLUMN descripcion TEXT");
}

if (!columnas.includes("imagen")) {
    db.exec("ALTER TABLE productos ADD COLUMN imagen TEXT");
}

// =====================================
// 3. PRODUCTOS INICIALES
// =====================================

const cantidad = db.prepare(
    "SELECT COUNT(*) AS total FROM productos"
).get();

if (cantidad.total === 0) {
    const insertar = db.prepare(`
        INSERT INTO productos
        (nombre, precio, categoria, descripcion, imagen)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertar.run(
        "SUDADERA URBAN",
        120000,
        "sudaderas",
        "Prendas cómodas con estilo urbano.",
        "imagenes/sudadera.jpg"
    );

    insertar.run(
        "CAMISETA STREET",
        65000,
        "camisetas",
        "Diseños para expresar tu personalidad.",
        "imagenes/camiseta.jpg"
    );

    insertar.run(
        "PANTALON BAGGY",
        150000,
        "pantalones",
        "Comodidad y actitud en cada paso.",
        "imagenes/pantalon.jpg"
    );
}

// =====================================
// 4. ADMINISTRADOR
// =====================================

const usuarioAdmin = process.env.ADMIN_USER;
const claveAdmin = process.env.ADMIN_PASSWORD;
const secreto = process.env.JWT_SECRET;

if (!usuarioAdmin || !claveAdmin || !secreto) {
    throw new Error("Revisa las variables del archivo .env");
}

const adminExiste = db.prepare(
    "SELECT id FROM administradores WHERE usuario = ?"
).get(usuarioAdmin);

if (!adminExiste) {
    const claveEncriptada = bcrypt.hashSync(claveAdmin, 12);

    db.prepare(`
        INSERT INTO administradores (usuario, password)
        VALUES (?, ?)
    `).run(usuarioAdmin, claveEncriptada);
}

// =====================================
// 5. RUTA PRINCIPAL
// =====================================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// =====================================
// 6. CONSULTAR PRODUCTOS
// =====================================

app.get("/api/productos", (req, res) => {
    const productos = db.prepare(
        "SELECT * FROM productos ORDER BY id DESC"
    ).all();

    res.json(productos);
});

app.get("/api/productos/:id", (req, res) => {
    const producto = db.prepare(
        "SELECT * FROM productos WHERE id = ?"
    ).get(Number(req.params.id));

    if (!producto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json(producto);
});

// =====================================
// 7. AUTENTICACIÓN
// =====================================

function verificarAdmin(req, res, next) {
    const autorizacion = req.headers.authorization;

    if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión"
        });
    }

    const token = autorizacion.split(" ")[1];

    try {
        req.admin = jwt.verify(token, secreto);
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: "Sesión inválida o vencida"
        });
    }
}

app.post("/api/admin/login", (req, res) => {
    const { usuario, password } = req.body;

    if (
        typeof usuario !== "string" ||
        typeof password !== "string" ||
        !usuario.trim() ||
        !password
    ) {
        return res.status(400).json({
            mensaje: "Completa usuario y contraseña"
        });
    }

    const admin = db.prepare(
        "SELECT * FROM administradores WHERE usuario = ?"
    ).get(usuario.trim());

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({
            mensaje: "Credenciales incorrectas"
        });
    }

    const token = jwt.sign(
        {
            id: admin.id,
            usuario: admin.usuario
        },
        secreto,
        { expiresIn: "2h" }
    );

    res.json({
        mensaje: "Inicio de sesión correcto",
        token
    });
});

app.get("/api/admin/perfil", verificarAdmin, (req, res) => {
    res.json({
        mensaje: "Acceso autorizado",
        administrador: req.admin.usuario
    });
});

// =====================================
// 8. CREAR PRODUCTOS
// =====================================

app.post("/api/productos", verificarAdmin, (req, res) => {
    const {
        nombre,
        precio,
        categoria,
        descripcion,
        imagen
    } = req.body;

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0 ||
        typeof categoria !== "string" || !categoria.trim()
    ) {
        return res.status(400).json({
            mensaje: "Datos del producto inválidos"
        });
    }

    const resultado = db.prepare(`
        INSERT INTO productos
        (nombre, precio, categoria, descripcion, imagen)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        nombre.trim(),
        precio,
        categoria.trim().toLowerCase(),
        typeof descripcion === "string" ? descripcion.trim() : "",
        typeof imagen === "string" ? imagen.trim() : ""
    );

    res.status(201).json({
        mensaje: "Producto creado correctamente",
        id: resultado.lastInsertRowid
    });
});

// =====================================
// 9. ACTUALIZAR PRODUCTOS
// =====================================

app.put("/api/productos/:id", verificarAdmin, (req, res) => {
    const {
        nombre,
        precio,
        categoria,
        descripcion,
        imagen
    } = req.body;

    const id = Number(req.params.id);

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0 ||
        typeof categoria !== "string" || !categoria.trim()
    ) {
        return res.status(400).json({
            mensaje: "Datos del producto inválidos"
        });
    }

    const resultado = db.prepare(`
        UPDATE productos
        SET nombre = ?,
            precio = ?,
            categoria = ?,
            descripcion = ?,
            imagen = ?
        WHERE id = ?
    `).run(
        nombre.trim(),
        precio,
        categoria.trim().toLowerCase(),
        typeof descripcion === "string" ? descripcion.trim() : "",
        typeof imagen === "string" ? imagen.trim() : "",
        id
    );

    if (resultado.changes === 0) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json({
        mensaje: "Producto actualizado correctamente"
    });
});

// =====================================
// 10. ELIMINAR PRODUCTOS
// =====================================

app.delete("/api/productos/:id", verificarAdmin, (req, res) => {
    const resultado = db.prepare(
        "DELETE FROM productos WHERE id = ?"
    ).run(Number(req.params.id));

    if (resultado.changes === 0) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json({
        mensaje: "Producto eliminado correctamente"
    });
});

// =====================================
// 11. REGISTRAR PEDIDOS
// =====================================

app.post("/api/pedidos", (req, res) => {
    const {
        nombre_cliente,
        correo,
        direccion,
        productos
    } = req.body;

    if (
        typeof nombre_cliente !== "string" || !nombre_cliente.trim() ||
        typeof correo !== "string" || !correo.trim() ||
        typeof direccion !== "string" || !direccion.trim() ||
        !Array.isArray(productos) || productos.length === 0
    ) {
        return res.status(400).json({
            mensaje: "Datos del pedido inválidos"
        });
    }

    let total = 0;
    const productosValidados = [];

    for (const item of productos) {
        const id = Number(item.id);
        const cantidad = Number(item.cantidad);

        if (
            !Number.isInteger(id) ||
            !Number.isInteger(cantidad) ||
            cantidad <= 0
        ) {
            return res.status(400).json({
                mensaje: "Producto o cantidad inválida"
            });
        }

        const producto = db.prepare(
            "SELECT id, nombre, precio FROM productos WHERE id = ?"
        ).get(id);

        if (!producto) {
            return res.status(400).json({
                mensaje: "Producto no encontrado"
            });
        }

        total += producto.precio * cantidad;

        productosValidados.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad
        });
    }

    const resultado = db.prepare(`
        INSERT INTO pedidos
        (nombre_cliente, correo, direccion, productos, total)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        nombre_cliente.trim(),
        correo.trim(),
        direccion.trim(),
        JSON.stringify(productosValidados),
        total
    );

    res.status(201).json({
        mensaje: "Pedido registrado",
        pedidoId: resultado.lastInsertRowid,
        total
    });
});

// =====================================
// 12. REGISTRAR MENSAJES
// =====================================

app.post("/api/contacto", (req, res) => {
    const { nombre, correo, mensaje } = req.body;

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof correo !== "string" || !correo.trim() ||
        typeof mensaje !== "string" || !mensaje.trim()
    ) {
        return res.status(400).json({
            mensaje: "Completa todos los campos"
        });
    }

    db.prepare(`
        INSERT INTO mensajes (nombre, correo, mensaje)
        VALUES (?, ?, ?)
    `).run(nombre.trim(), correo.trim(), mensaje.trim());

    res.status(201).json({
        mensaje: "Mensaje recibido correctamente"
    });
});

// =====================================
// 13. INICIAR SERVIDOR
// =====================================

app.listen(PORT, () => {
    console.log(
        "Servidor funcionando en http://localhost:" + PORT
    );
});
