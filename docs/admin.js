
const API = "https://urban-style-rok5.onrender.com/api";

const formularioLogin = document.getElementById("formulario-login");
const formularioProducto = document.getElementById("formulario-producto");

const inicioSesion = document.getElementById("inicio-sesion");
const panelAdmin = document.getElementById("panel-admin");

const mensajeLogin = document.getElementById("mensaje-login");
const mensajeProducto = document.getElementById("mensaje-producto");
const listaProductos = document.getElementById("lista-productos");

let token = null;

formularioLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const respuesta = await fetch(`${API}/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: document.getElementById("usuario").value.trim(),
                password: document.getElementById("password").value
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        token = resultado.token;

        inicioSesion.hidden = true;
        panelAdmin.hidden = false;

        await cargarProductos();

    } catch (error) {
        mensajeLogin.textContent = error.message;
    }
});

async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API}/productos`);
        const productos = await respuesta.json();

        listaProductos.innerHTML = "";

        productos.forEach(producto => {
            const elemento = document.createElement("div");

            const nombre = document.createElement("h3");
            nombre.textContent = producto.nombre;

            const precio = document.createElement("p");
            precio.textContent =
                "$" + Number(producto.precio).toLocaleString("es-CO") + " COP";

            const eliminar = document.createElement("button");
            eliminar.textContent = "ELIMINAR";

            eliminar.addEventListener("click", () => {
                eliminarProducto(producto.id);
            });

            elemento.append(nombre, precio, eliminar);
            listaProductos.appendChild(elemento);
        });

    } catch (error) {
        listaProductos.textContent = "No se pudieron cargar los productos.";
    }
}

formularioProducto.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const respuesta = await fetch(`${API}/productos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre: document.getElementById("nombre").value.trim(),
                precio: Number(document.getElementById("precio").value),
                categoria: document.getElementById("categoria").value,
                descripcion: document.getElementById("descripcion").value.trim(),
                imagen: document.getElementById("imagen").value.trim()
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        mensajeProducto.textContent = "Producto creado correctamente.";

        formularioProducto.reset();
        await cargarProductos();

    } catch (error) {
        mensajeProducto.textContent = error.message;
    }
});

async function eliminarProducto(id) {
    if (!confirm("¿Deseas eliminar este producto?")) return;

    try {
        const respuesta = await fetch(`${API}/productos/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        mensajeProducto.textContent = "Producto eliminado.";
        await cargarProductos();

    } catch (error) {
        mensajeProducto.textContent = error.message;
    }
}

document.getElementById("cerrar-sesion").addEventListener("click", () => {
    token = null;
    panelAdmin.hidden = true;
    inicioSesion.hidden = false;
    formularioLogin.reset();
    listaProductos.innerHTML = "";
    mensajeLogin.textContent = "Sesión cerrada.";
});
