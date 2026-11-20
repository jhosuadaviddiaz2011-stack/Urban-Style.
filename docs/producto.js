const productos = [
    {
        id: 7,
        nombre: "SUDADERA URBAN",
        precio: 150000,
        categoria: "sudaderas",
        descripcion: "te veras super increible",
        imagen: "imagenes/sudadera.jpg"
    },
    {
        id: 6,
        nombre: "CAMISETA STREET",
        precio: 50000,
        categoria: "camisetas",
        descripcion: "te veras super increible",
        imagen: "imagenes/camiseta.jpg"
    },
    {
        id: 5,
        nombre: "PANTALON BAGGY",
        precio: 50000,
        categoria: "camisetas",
        descripcion: "te veras super increible",
        imagen: "imagenes/pantalon.jpg"
    }
];

const parametros = new URLSearchParams(window.location.search);
const idProducto = Number(parametros.get("id"));

const nombreProducto = document.getElementById("nombre-producto");
const descripcionProducto = document.getElementById("descripcion-producto");
const precioProducto = document.getElementById("precio-producto");
const imagenProducto = document.getElementById("imagen-producto");
const botonCarrito = document.getElementById("agregar-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");

const productoActual = productos.find(p => p.id === idProducto);

function mostrarError() {
    nombreProducto.textContent = "PRODUCTO NO ENCONTRADO";
    descripcionProducto.textContent = "Regresa al catálogo.";
    botonCarrito.disabled = true;
}

if (productoActual) {
    nombreProducto.textContent = productoActual.nombre;
    descripcionProducto.textContent = productoActual.descripcion;
    precioProducto.textContent =
        "$" + productoActual.precio.toLocaleString("es-CO") + " COP";

    imagenProducto.src = productoActual.imagen;
    imagenProducto.alt = productoActual.nombre;
} else {
    mostrarError();
}

const tallas = document.querySelectorAll(".talla");

tallas.forEach(talla => {
    talla.addEventListener("click", () => {
        tallas.forEach(otra => otra.classList.remove("seleccionada"));
        talla.classList.add("seleccionada");
        mensajeCarrito.textContent = "";
    });
});

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

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const nuevoProducto = {
        id: productoActual.id,
        nombre: productoActual.nombre,
        precio: productoActual.precio,
        imagen: productoActual.imagen,
        talla: tallaSeleccionada.textContent,
        cantidad: 1
    };

    const existente = carrito.find(item =>
        item.id === nuevoProducto.id &&
        item.talla === nuevoProducto.talla
    );

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push(nuevoProducto);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mensajeCarrito.textContent = "¡Producto agregado al carrito!";
});
