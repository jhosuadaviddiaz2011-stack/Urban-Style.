
const API = "https://urban-style-rok5.onrender.com/api";

const buscador = document.getElementById("buscar-producto");
const contenedor = document.getElementById("contenedor-productos");
const estado = document.getElementById("estado-productos");

const categorias = document.querySelectorAll(".categorias button");

let todosLosProductos = [];
let categoriaSeleccionada = "todo";

// CARGAR PRODUCTOS DESDE SUPABASE

async function cargarProductos() {
    estado.textContent = "Cargando productos...";

    try {
        const respuesta = await fetch(`${API}/productos`);

        if (!respuesta.ok) {
            throw new Error("Error al consultar productos");
        }

        todosLosProductos = await respuesta.json();

        filtrarProductos();

    } catch (error) {
        console.error(error);
        estado.textContent = "No se pudieron cargar los productos.";
    }
}

// MOSTRAR PRODUCTOS

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

        imagen.onerror = function () {
            this.onerror = null;
            this.alt = "Imagen no disponible";
        };

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.descripcion || "";

        const precio = document.createElement("span");
        precio.textContent =
            Number(producto.precio).toLocaleString("es-CO") + " COP";

        const boton = document.createElement("a");
        boton.href = `producto.html?id=${producto.id}`;
        boton.className = "boton-principal";
        boton.textContent = "VER PRODUCTO";

        tarjeta.append(
            imagen,
            nombre,
            descripcion,
            precio,
            boton
        );

        contenedor.appendChild(tarjeta);
    });
}

// BUSCADOR Y CATEGORÍAS

function filtrarProductos() {
    const texto = buscador.value.toLowerCase().trim();

    const resultado = todosLosProductos.filter(producto => {
        const nombre = (producto.nombre || "").toLowerCase();
        const descripcion = (producto.descripcion || "").toLowerCase();
        const categoria = (producto.categoria || "").toLowerCase();

        const coincideTexto =
            nombre.includes(texto) ||
            descripcion.includes(texto) ||
            categoria.includes(texto);

        const coincideCategoria =
            categoriaSeleccionada === "todo" ||
            categoria === categoriaSeleccionada;

        return coincideTexto && coincideCategoria;
    });

    mostrarProductos(resultado);
}

// EVENTOS

buscador.addEventListener("input", filtrarProductos);

categorias.forEach(boton => {
    boton.addEventListener("click", () => {
        categoriaSeleccionada = boton.dataset.categoria;
        filtrarProductos();
    });
});

// INICIAR

cargarProductos();
