
const tallas = document.querySelectorAll(".talla");

tallas.forEach(function(talla) {

    talla.addEventListener("click", function() {

        tallas.forEach(function(otraTalla) {
            otraTalla.classList.remove("seleccionada");
        });

        talla.classList.add("seleccionada");

    });

});

const botonCarrito = document.getElementById("agregar-carrito");

const mensajeCarrito = document.getElementById("mensaje-carrito");

botonCarrito.addEventListener("click", function() {

    const tallaSeleccionada = document.querySelector(".talla.seleccionada");

    if (tallaSeleccionada === null) {

        mensajeCarrito.textContent = "Por favor, selecciona una talla.";

        return;

    }

    const producto = {
        nombre: "SUDADERA URBAN",
        precio: 120000,
        talla: tallaSeleccionada.textContent,
        cantidad: 1
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.push(producto);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mensajeCarrito.textContent = "¡Producto agregado al carrito!";

});
