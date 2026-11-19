
const productosDisponibles = {

    sudadera: {
        nombre: "SUDADERA URBAN",
        precio: 120000,
        imagen: "imagenes/sudadera.jpg",
        descripcion: "Una prenda diseñada para combinar comodidad, personalidad y estilo urbano."
    },

    camiseta: {
        nombre: "CAMISETA STREET",
        precio: 65000,
        imagen: "imagenes/camiseta.jpg",
        descripcion: "Diseños que expresan tu personalidad y representan tu estilo."
    },

    pantalon: {
        nombre: "PANTALÓN BAGGY",
        precio: 150000,
        imagen: "imagenes/pantalon.jpg",
        descripcion: "Libertad de movimiento y estilo para cualquier ocasión."
    }

};


const parametros = new URLSearchParams(window.location.search);

const productoSeleccionado = parametros.get("producto");


const producto = productosDisponibles[productoSeleccionado];


if (producto) {

    document.getElementById("nombre-producto").textContent = producto.nombre;

    document.getElementById("descripcion-producto").textContent = producto.descripcion;

    document.getElementById("precio-producto").textContent =
        "$" + producto.precio.toLocaleString("es-CO") + " COP";

    document.getElementById("imagen-producto").src = producto.imagen;

    document.getElementById("imagen-producto").alt = producto.nombre;

} else {

    document.getElementById("nombre-producto").textContent =
        "PRODUCTO NO ENCONTRADO";

}

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

    if (!producto) {
        mensajeCarrito.textContent = "No se encontró el producto.";
        return;
    }

    const nuevoProducto = {
        nombre: producto.nombre,
        precio: producto.precio,
        talla: tallaSeleccionada.textContent,
        cantidad: 1
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    

const productoExistente = carrito.find(function(item) {
    return item.nombre === nuevoProducto.nombre &&
           item.talla === nuevoProducto.talla;
});


if (productoExistente) {

    productoExistente.cantidad++;

} else {

    carrito.push(nuevoProducto);

}

localStorage.setItem("carrito", JSON.stringify(carrito));

    mensajeCarrito.textContent = "¡Producto agregado al carrito!";
});