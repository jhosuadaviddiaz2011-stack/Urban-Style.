const todosLosProductos = [
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

const buscador = document.getElementById("buscar-producto");
const contenedor = document.getElementById("contenedor-productos");
const estado = document.getElementById("estado-productos");
const categorias = document.querySelectorAll(".categorias button");

let categoriaSeleccionada = "todo";

function mostrarProductos(productos) {
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        estado.textContent = "No hay productos disponibles.";
        return;
    }

    estado.textContent = "";

    productos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto";

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.descripcion;

        const precio = document.createElement("span");
        precio.textContent =
            Number(producto.precio).toLocaleString("es-CO") + " COP";

        const boton = document.createElement("a");
        boton.href = `producto.html?id=${producto.id}`;
        boton.className = "boton-principal";
        boton.textContent = "VER PRODUCTO";

        tarjeta.append(imagen, nombre, descripcion, precio, boton);
        contenedor.appendChild(tarjeta);
    });
}

function filtrarProductos() {
    const texto = buscador.value.toLowerCase().trim();

    const resultado = todosLosProductos.filter(producto => {
        const coincideTexto =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.descripcion.toLowerCase().includes(texto) ||
            producto.categoria.toLowerCase().includes(texto);

        const coincideCategoria =
            categoriaSeleccionada === "todo" ||
            producto.categoria === categoriaSeleccionada;

        return coincideTexto && coincideCategoria;
    });

    mostrarProductos(resultado);
}

buscador.addEventListener("input", filtrarProductos);

categorias.forEach(boton => {
    boton.addEventListener("click", () => {
        categoriaSeleccionada = boton.dataset.categoria;
        filtrarProductos();
    });
});

mostrarProductos(todosLosProductos);
