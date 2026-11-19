
require("dotenv").config();

const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database("urbanstyle.db");

const usuario = process.env.ADMIN_USER;
const password = process.env.ADMIN_PASSWORD;

if (!usuario || !password) {
    throw new Error("Faltan las credenciales en .env");
}

const passwordEncriptada = bcrypt.hashSync(password, 12);

const resultado = db.prepare(`
    UPDATE administradores
    SET password = ?
    WHERE usuario = ?
`).run(passwordEncriptada, usuario);

if (resultado.changes === 0) {
    console.log("No se encontró el administrador.");
} else {
    console.log("Contraseña del administrador actualizada.");
}

db.close();
