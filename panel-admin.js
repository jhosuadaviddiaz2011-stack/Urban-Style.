

const API = "http://localhost:3000/api";
const token = sessionStorage.getItem("adminToken");

const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("productoForm");
const mensaje = document.getElementById("mensajeAdmin");

async function verificarSesion() {
    if (!token) {
        window.location.href = "admin.html";
        return;
    }

    try {
        const respuesta = await fetch(`${API}/admin/perfil`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            sessionStorage.removeItem("adminToken");
            window.location.href = "admin.html";
        }
    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
    }
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API}/productos`);
        if (!respuesta.ok) throw new Error("Error al consultar productos");

        const productos = await respuesta.json();
        listaProductos.innerHTML = "";

        productos.forEach(producto => {
            const elemento = document.createElement("article");

            const nombre = document.createElement("h4");
            nombre.textContent = producto.nombre;

            const descripcion = document.createElement("p");
            descripcion.textContent = producto.descripcion || "";

            const precio = document.createElement("p");
            precio.textContent = `Precio: $${producto.precio}`;

            const categoria = document.createElement("p");
            categoria.textContent = `Categoría: ${producto.categoria}`;

            const imagen = document.createElement("p");
            imagen.textContent = `Imagen: ${producto.imagen || "Sin imagen asignada"}`;

            const botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.addEventListener("click", () => editarProducto(producto.id));

            const botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.addEventListener("click", () => eliminarProducto(producto.id));

            elemento.append(
                nombre,
                descripcion,
                precio,
                categoria,
                imagen,
                botonEditar,
                botonEliminar
            );

            listaProductos.appendChild(elemento);
        });
    } catch (error) {
        listaProductos.textContent = "Error al cargar los productos.";
    }
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const producto = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        precio: Number(document.getElementById("precio").value),
        imagen: document.getElementById("imagen").value.trim(),
        categoria: document.getElementById("categoria").value.trim()
    };

    try {
        const respuesta = await fetch(`${API}/productos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        });

        const datos = await respuesta.json();
        mensaje.textContent = datos.mensaje || "Producto guardado.";

        if (respuesta.ok) {
            formulario.reset();
            cargarProductos();
        }
    } catch (error) {
        mensaje.textContent = "No se pudo guardar el producto.";
    }
});

async function eliminarProducto(id) {
    if (!confirm("¿Quieres eliminar este producto?")) return;

    try {
        const respuesta = await fetch(`${API}/productos/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (respuesta.ok) {
            cargarProductos();
        } else {
            alert("No se pudo eliminar el producto.");
        }
    } catch (error) {
        alert("Error de conexión.");
    }
}

async function editarProducto(id) {
    try {
        const respuestaProducto = await fetch(`${API}/productos/${id}`);
        if (!respuestaProducto.ok) throw new Error();

        const producto = await respuestaProducto.json();

        const nombre = prompt("Nombre del producto:", producto.nombre);
        if (nombre === null || !nombre.trim()) return;

        const precioTexto = prompt("Precio:", producto.precio);
        if (precioTexto === null) return;

        const precio = Number(precioTexto);
        if (!Number.isFinite(precio) || precio <= 0) {
            alert("Ingresa un precio válido.");
            return;
        }

        const imagen = prompt(
            "Ruta de la imagen (ejemplo: imagenes/camiseta.jpg):",
            producto.imagen || ""
        );

        if (imagen === null) return;

        const actualizado = {
            ...producto,
            nombre: nombre.trim(),
            precio,
            imagen: imagen.trim()
        };

        const respuesta = await fetch(`${API}/productos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(actualizado)
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert("Producto actualizado correctamente.");
            cargarProductos();
        } else {
            alert(datos.mensaje || "No se pudo actualizar.");
        }
    } catch (error) {
        alert("Error al editar el producto.");
    }
}

document.getElementById("cerrarSesion").addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "admin.html";
});

verificarSesion();
cargarProductos();

