
// ELEMENTOS DEL HTML
const buscador = document.getElementById("buscar-producto");

const productos = document.querySelectorAll(".producto");

const categorias = document.querySelectorAll(".categorias button");

let categoriaSeleccionada = "todo";


// FUNCIÓN PARA FILTRAR PRODUCTOS
function filtrarProductos() {

    const texto = buscador.value.toLowerCase();

    productos.forEach(function(producto) {

        const nombre = producto.querySelector("h3").textContent.toLowerCase();

        const coincideTexto = nombre.includes(texto);

        const coincideCategoria =
            categoriaSeleccionada === "todo" ||
            nombre.includes(categoriaSeleccionada);

        if (coincideTexto && coincideCategoria) {

            producto.style.display = "block";

        } else {

            producto.style.display = "none";

        }

    });

}


// BUSCADOR
buscador.addEventListener("input", function() {

    filtrarProductos();

});


// FILTRO POR CATEGORÍAS
categorias.forEach(function(categoria) {

    categoria.addEventListener("click", function() {

        categoriaSeleccionada = categoria.textContent.toLowerCase();

        filtrarProductos();

    });

});
