

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


const listaCarrito = document.getElementById("lista-carrito");

const totalCarrito = document.getElementById("total-carrito");

const botonVaciar = document.getElementById("vaciar-carrito");



function mostrarCarrito() {

    listaCarrito.innerHTML = "";

    let total = 0;

    carrito.forEach(function(producto, indice) {

        const elemento = document.createElement("div");

        elemento.classList.add("producto-carrito");

        elemento.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Talla: ${producto.talla}</p>
            <p>Precio: $${producto.precio.toLocaleString("es-CO")} COP</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <button onclick="eliminarProducto(${indice})">
                ELIMINAR
            </button>
        `;

        listaCarrito.appendChild(elemento);

        total += producto.precio * producto.cantidad;

    });

    totalCarrito.textContent = "TOTAL: $" + total.toLocaleString("es-CO") + " COP";

}

function eliminarProducto(indice) {

    carrito.splice(indice, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

}

botonVaciar.addEventListener("click", function() {

    carrito = [];

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

});


// EJECUTAR AL ABRIR LA PÁGINA
mostrarCarrito();
