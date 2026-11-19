
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
