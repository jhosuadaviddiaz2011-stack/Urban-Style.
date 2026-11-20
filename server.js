
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",
        "https://jhosuadaviddiaz2011-stack.github.io"
    ]
}));

// =====================================
// 1. CONEXIÓN CON SUPABASE
// =====================================

if (!process.env.DATABASE_URL) {
    throw new Error("Falta la variable DATABASE_URL");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const secreto = process.env.JWT_SECRET;

// =====================================
// 2. CONFIGURACIÓN DEL ADMINISTRADOR
// =====================================

const usuarioAdmin = process.env.ADMIN_USER;
const claveAdmin = process.env.ADMIN_PASSWORD;

if (!usuarioAdmin || !claveAdmin || !secreto) {
    throw new Error("Revisa las variables de entorno");
}

async function prepararAdministrador() {
    const resultado = await pool.query(
        "SELECT id FROM administradores WHERE usuario = $1",
        [usuarioAdmin]
    );

    if (resultado.rows.length === 0) {
        const claveEncriptada = await bcrypt.hash(claveAdmin, 12);

        await pool.query(
            `INSERT INTO administradores (usuario, password)
             VALUES ($1, $2)`,
            [usuarioAdmin, claveEncriptada]
        );

        console.log("Administrador creado correctamente");
    }
}

// =====================================
// 3. RUTA PRINCIPAL
// =====================================

app.get("/", (req, res) => {
    res.json({
        mensaje: "Servidor de URBAN STYLE funcionando"
    });
});

// =====================================
// 4. CONSULTAR PRODUCTOS
// =====================================

app.get("/api/productos", async (req, res) => {
    const resultado = await pool.query(
        "SELECT * FROM productos ORDER BY id DESC"
    );

    const productos = resultado.rows.map(producto => ({
        ...producto,
        precio: Number(producto.precio)
    }));

    res.json(productos);
});

app.get("/api/productos/:id", async (req, res) => {
    const resultado = await pool.query(
        "SELECT * FROM productos WHERE id = $1",
        [Number(req.params.id)]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    const producto = resultado.rows[0];
    producto.precio = Number(producto.precio);

    res.json(producto);
});

// =====================================
// 5. AUTENTICACIÓN
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

app.post("/api/admin/login", async (req, res) => {
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

    const resultado = await pool.query(
        "SELECT * FROM administradores WHERE usuario = $1",
        [usuario.trim()]
    );

    const admin = resultado.rows[0];

    if (!admin || !await bcrypt.compare(password, admin.password)) {
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
// 6. CREAR PRODUCTOS
// =====================================

app.post("/api/productos", verificarAdmin, async (req, res) => {
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

    const resultado = await pool.query(
        `INSERT INTO productos
         (nombre, precio, categoria, descripcion, imagen)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
            nombre.trim(),
            precio,
            categoria.trim().toLowerCase(),
            typeof descripcion === "string" ? descripcion.trim() : "",
            typeof imagen === "string" ? imagen.trim() : ""
        ]
    );

    res.status(201).json({
        mensaje: "Producto creado correctamente",
        id: resultado.rows[0].id
    });
});

// =====================================
// 7. ACTUALIZAR PRODUCTOS
// =====================================

app.put("/api/productos/:id", verificarAdmin, async (req, res) => {
    const {
        nombre,
        precio,
        categoria,
        descripcion,
        imagen
    } = req.body;

    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0 ||
        typeof categoria !== "string" || !categoria.trim()
    ) {
        return res.status(400).json({
            mensaje: "Datos del producto inválidos"
        });
    }

    const resultado = await pool.query(
        `UPDATE productos
         SET nombre = $1,
             precio = $2,
             categoria = $3,
             descripcion = $4,
             imagen = $5
         WHERE id = $6`,
        [
            nombre.trim(),
            precio,
            categoria.trim().toLowerCase(),
            typeof descripcion === "string" ? descripcion.trim() : "",
            typeof imagen === "string" ? imagen.trim() : "",
            id
        ]
    );

    if (resultado.rowCount === 0) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json({
        mensaje: "Producto actualizado correctamente"
    });
});

// =====================================
// 8. ELIMINAR PRODUCTOS
// =====================================

app.delete("/api/productos/:id", verificarAdmin, async (req, res) => {
    const resultado = await pool.query(
        "DELETE FROM productos WHERE id = $1",
        [Number(req.params.id)]
    );

    if (resultado.rowCount === 0) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json({
        mensaje: "Producto eliminado correctamente"
    });
});

// =====================================
// 9. REGISTRAR PEDIDOS
// =====================================


app.post("/api/pedidos", async (req, res) => {
    const {
        nombre_cliente,
        correo,
        telefono,
        direccion,
        ciudad,
        productos
    } = req.body;

    if (
        typeof nombre_cliente !== "string" || !nombre_cliente.trim() ||
        typeof correo !== "string" || !correo.trim() ||
        typeof telefono !== "string" || !telefono.trim() ||
        typeof direccion !== "string" || !direccion.trim() ||
        typeof ciudad !== "string" || !ciudad.trim() ||
        !Array.isArray(productos) || productos.length === 0
    ) {
        return res.status(400).json({
            mensaje: "Completa correctamente todos los datos"
        });
    }

    try {
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

            const resultado = await pool.query(
                "SELECT id, nombre, precio FROM productos WHERE id = $1",
                [id]
            );

            const producto = resultado.rows[0];

            if (!producto) {
                return res.status(400).json({
                    mensaje: "Producto no encontrado"
                });
            }

            const precio = Number(producto.precio);
            total += precio * cantidad;

            productosValidados.push({
                id: producto.id,
                nombre: producto.nombre,
                precio,
                cantidad,
                talla: typeof item.talla === "string" ? item.talla : ""
            });
        }

        const resultado = await pool.query(
            `INSERT INTO pedidos
            (nombre_cliente, correo, telefono, direccion, ciudad, productos, total)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
                nombre_cliente.trim(),
                correo.trim(),
                telefono.trim(),
                direccion.trim(),
                ciudad.trim(),
                JSON.stringify(productosValidados),
                total
            ]
        );

        res.status(201).json({
            mensaje: "Pedido registrado correctamente",
            pedidoId: resultado.rows[0].id,
            total
        });

    } catch (error) {
        console.error("Error al registrar pedido:", error);
        res.status(500).json({
            mensaje: "No se pudo registrar el pedido"
        });
    }
});


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

        const resultado = await pool.query(
            "SELECT id, nombre, precio FROM productos WHERE id = $1",
            [id]
        );

        const producto = resultado.rows[0];

        if (!producto) {
            return res.status(400).json({
                mensaje: "Producto no encontrado"
            });
        }

        const precio = Number(producto.precio);
        total += precio * cantidad;

        productosValidados.push({
            id: producto.id,
            nombre: producto.nombre,
            precio,
            cantidad
        });
    }

    const resultado = await pool.query(
        `INSERT INTO pedidos
         (nombre_cliente, correo, direccion, productos, total)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
            nombre_cliente.trim(),
            correo.trim(),
            direccion.trim(),
            JSON.stringify(productosValidados),
            total
        ]
    );

    res.status(201).json({
        mensaje: "Pedido registrado",
        pedidoId: resultado.rows[0].id,
        total
    });
});

// =====================================
// 10. REGISTRAR MENSAJES
// =====================================

app.post("/api/contacto", async (req, res) => {
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

    await pool.query(
        `INSERT INTO mensajes (nombre, correo, mensaje)
         VALUES ($1, $2, $3)`,
        [nombre.trim(), correo.trim(), mensaje.trim()]
    );

    res.status(201).json({
        mensaje: "Mensaje recibido correctamente"
    });
});

// =====================================
// 11. INICIAR SERVIDOR
// =====================================

async function iniciarServidor() {
    try {
        await pool.query("SELECT 1");
        console.log("Conexión con Supabase exitosa");

        await prepararAdministrador();

        app.listen(PORT, () => {
            console.log("Servidor funcionando en el puerto " + PORT);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
}

iniciarServidor();
