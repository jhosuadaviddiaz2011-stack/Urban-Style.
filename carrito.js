
let carrito = [];

try {
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!Array.isArray(carrito)) carrito = [];
} catch (error) {
    carrito = [];
}

const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonVaciar = document.getElementById("vaciar-carrito");
const botonFinalizar = document.querySelector(
    'a[href="finalizar-compra.html"]'
);

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function mostrarCarrito() {
    listaCarrito.innerHTML = "";

    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.textContent = "Tu carrito está vacío.";
        totalCarrito.textContent = "TOTAL: $0 COP";
        botonFinalizar.style.pointerEvents = "none";
        botonFinalizar.style.opacity = "0.5";
        return;
    }

    botonFinalizar.style.pointerEvents = "auto";
    botonFinalizar.style.opacity = "1";

    carrito.forEach((producto, indice) => {
        const elemento = document.createElement("div");
        elemento.classList.add("producto-carrito");

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const talla = document.createElement("p");
        talla.textContent = "Talla: " + producto.talla;

        const precio = document.createElement("p");
        precio.textContent =
            "Precio: $" +
            Number(producto.precio).toLocaleString("es-CO") +
            " COP";

        const controles = document.createElement("div");
        controles.classList.add("controles-cantidad");

        const disminuir = document.createElement("button");
        disminuir.textContent = "−";
        disminuir.addEventListener("click", () => {
            cambiarCantidad(indice, -1);
        });

        const cantidad = document.createElement("span");
        cantidad.textContent = producto.cantidad;

        const aumentar = document.createElement("button");
        aumentar.textContent = "+";
        aumentar.addEventListener("click", () => {
            cambiarCantidad(indice, 1);
        });

        controles.append(disminuir, cantidad, aumentar);

        const eliminar = document.createElement("button");
        eliminar.textContent = "ELIMINAR";
        eliminar.addEventListener("click", () => {
            eliminarProducto(indice);
        });

        elemento.append(nombre, talla, precio, controles, eliminar);
        listaCarrito.appendChild(elemento);

        total += Number(producto.precio) * Number(producto.cantidad);
    });

    totalCarrito.textContent =
        "TOTAL: $" + total.toLocaleString("es-CO") + " COP";
}

function cambiarCantidad(indice, cambio) {
    carrito[indice].cantidad += cambio;

    if (carrito[indice].cantidad < 1) {
        carrito[indice].cantidad = 1;
    }

    guardarCarrito();
    mostrarCarrito();
}

function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    mostrarCarrito();
}

botonVaciar.addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
});

mostrarCarrito();
