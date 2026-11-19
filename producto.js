
const API = "http://localhost:3000/api";

const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

const nombreProducto = document.getElementById("nombre-producto");
const descripcionProducto = document.getElementById("descripcion-producto");
const precioProducto = document.getElementById("precio-producto");
const imagenProducto = document.getElementById("imagen-producto");
const botonCarrito = document.getElementById("agregar-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");

let productoActual = null;

// Consultar el producto en la base de datos
async function cargarProducto() {
    if (!idProducto || !Number.isInteger(Number(idProducto))) {
        mostrarError();
        return;
    }

    try {
        const respuesta = await fetch(`${API}/productos/${idProducto}`);

        if (!respuesta.ok) {
            mostrarError();
            return;
        }

        productoActual = await respuesta.json();

        nombreProducto.textContent = productoActual.nombre;
        descripcionProducto.textContent =
            productoActual.descripcion || "Prenda de URBAN STYLE.";

        precioProducto.textContent =
            "$" + Number(productoActual.precio).toLocaleString("es-CO") + " COP";

        imagenProducto.src = productoActual.imagen || "";
        imagenProducto.alt = productoActual.nombre;

        imagenProducto.onerror = function () {
            this.onerror = null;
            this.alt = "Imagen no disponible";
        };

    } catch (error) {
        console.error("Error al consultar el producto:", error);
        mostrarError();
    }
}

function mostrarError() {
    nombreProducto.textContent = "PRODUCTO NO ENCONTRADO";
    descripcionProducto.textContent =
        "No pudimos encontrar este producto. Regresa al catálogo.";
    precioProducto.textContent = "";
    botonCarrito.disabled = true;
}

// Seleccionar talla
const tallas = document.querySelectorAll(".talla");

tallas.forEach(talla => {
    talla.addEventListener("click", () => {
        tallas.forEach(otraTalla => {
            otraTalla.classList.remove("seleccionada");
        });

        talla.classList.add("seleccionada");
        mensajeCarrito.textContent = "";
    });
});

// Agregar producto al carrito
botonCarrito.addEventListener("click", () => {
    const tallaSeleccionada = document.querySelector(".talla.seleccionada");

    if (!productoActual) {
        mensajeCarrito.textContent = "No se encontró el producto.";
        return;
    }

    if (!tallaSeleccionada) {
        mensajeCarrito.textContent = "Por favor, selecciona una talla.";
        return;
    }

    const nuevoProducto = {
        id: productoActual.id,
        nombre: productoActual.nombre,
        precio: Number(productoActual.precio),
        imagen: productoActual.imagen || "",
        talla: tallaSeleccionada.textContent,
        cantidad: 1
    };

    let carrito = [];

    try {
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        if (!Array.isArray(carrito)) {
            carrito = [];
        }
    } catch (error) {
        carrito = [];
    }

    const productoExistente = carrito.find(item =>
        item.id === nuevoProducto.id &&
        item.talla === nuevoProducto.talla
    );

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push(nuevoProducto);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mensajeCarrito.textContent = "¡Producto agregado al carrito!";
});

cargarProducto();
