
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: true
}));

// =====================================
// 1. CONEXION A LA BASE DE DATOS
// =====================================

const db = new Database("urbanstyle.db");

// Crear tabla de productos
db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        categoria TEXT NOT NULL
    )
`);

// Crear tabla de pedidos
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

// Crear tabla de mensajes
db.exec(`
    CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Crear tabla de administradores
db.exec(`
    CREATE TABLE IF NOT EXISTS administradores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

// =====================================
// 2. PRODUCTOS INICIALES
// =====================================

const cantidad = db.prepare(
    "SELECT COUNT(*) AS total FROM productos"
).get();

if (cantidad.total === 0) {
    const insertar = db.prepare(`
        INSERT INTO productos (nombre, precio, categoria)
        VALUES (?, ?, ?)
    `);

    insertar.run("SUDADERA URBAN", 120000, "sudaderas");
    insertar.run("CAMISETA STREET", 65000, "camisetas");
    insertar.run("PANTALON BAGGY", 150000, "pantalones");
}

// =====================================
// 3. CREAR ADMINISTRADOR
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
// 4. RUTA PRINCIPAL
// =====================================

app.get("/", (req, res) => {
    res.send("Backend de URBAN STYLE funcionando");
});

// =====================================
// 5. CONSULTAR PRODUCTOS
// =====================================

app.get("/api/productos", (req, res) => {
    const productos = db.prepare(
        "SELECT * FROM productos"
    ).all();

    res.json(productos);
});

// Consultar un producto por ID
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
// 6. CREAR PRODUCTOS
// =====================================

app.post("/api/productos", verificarAdmin, (req, res) => {
    const { nombre, precio, categoria } = req.body;

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0 ||
        typeof categoria !== "string" || !categoria.trim()
    ) {
        return res.status(400).json({
            mensaje: "Datos del producto invalidos"
        });
    }

    const resultado = db.prepare(`
        INSERT INTO productos (nombre, precio, categoria)
        VALUES (?, ?, ?)
    `).run(nombre.trim(), precio, categoria.trim());

    res.status(201).json({
        mensaje: "Producto creado",
        id: resultado.lastInsertRowid
    });
});

// =====================================
// 7. ACTUALIZAR PRODUCTOS
// =====================================

app.put("/api/productos/:id", verificarAdmin, (req, res) => {
    const { nombre, precio, categoria } = req.body;
    const id = Number(req.params.id);

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0 ||
        typeof categoria !== "string" || !categoria.trim()
    ) {
        return res.status(400).json({
            mensaje: "Datos del producto invalidos"
        });
    }

    const resultado = db.prepare(`
        UPDATE productos
        SET nombre = ?, precio = ?, categoria = ?
        WHERE id = ?
    `).run(nombre.trim(), precio, categoria.trim(), id);

    if (resultado.changes === 0) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json({
        mensaje: "Producto actualizado"
    });
});

// =====================================
// 8. ELIMINAR PRODUCTOS
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
        mensaje: "Producto eliminado"
    });
});

// =====================================
// 9. REGISTRAR PEDIDOS
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
            mensaje: "Datos del pedido invalidos"
        });
    }

    // Consultar precios reales desde la base de datos
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
                mensaje: "Producto o cantidad invalida"
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
            cantidad: cantidad
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
        total: total
    });
});

// =====================================
// 10. REGISTRAR MENSAJES
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
// 11. INICIO DE SESION ADMINISTRADOR
// =====================================

app.post("/api/admin/login", (req, res) => {
    const { usuario, password } = req.body;

    if (
        typeof usuario !== "string" ||
        typeof password !== "string" ||
        !usuario.trim() ||
        !password
    ) {
        return res.status(400).json({
            mensaje: "Completa usuario y contrasena"
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
        mensaje: "Inicio de sesion correcto",
        token: token
    });
});

// =====================================
// 12. PROTEGER RUTAS ADMINISTRATIVAS
// =====================================

function verificarAdmin(req, res, next) {
    const autorizacion = req.headers.authorization;

    if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesion"
        });
    }

    const token = autorizacion.split(" ")[1];

    try {
        req.admin = jwt.verify(token, secreto);
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: "Sesion invalida o vencida"
        });
    }
}

// Consultar perfil del administrador
app.get("/api/admin/perfil", verificarAdmin, (req, res) => {
    res.json({
        mensaje: "Acceso autorizado",
        administrador: req.admin.usuario
    });
});

// =====================================
// 13. INICIAR SERVIDOR
// =====================================

app.listen(PORT, () => {
    console.log("Servidor funcionando en http://localhost:" + PORT);
});
