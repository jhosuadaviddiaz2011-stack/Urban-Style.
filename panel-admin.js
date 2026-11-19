
const API = "http://localhost:3000/api";
const token = sessionStorage.getItem("adminToken");

const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("productoForm");
const mensaje = document.getElementById("mensajeAdmin");

// Verificar que el administrador tenga una sesión válida
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

// Consultar productos
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API}/productos`);
        const productos = await respuesta.json();

        listaProductos.innerHTML = "";

        productos.forEach(producto => {
            const elemento = document.createElement("article");

            elemento.innerHTML = `
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion || ""}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Categoría: ${producto.categoria || ""}</p>
                <button onclick="editarProducto(${producto.id})">
                    Editar
                </button>
                <button onclick="eliminarProducto(${producto.id})">
                    Eliminar
                </button>
            `;

            listaProductos.appendChild(elemento);
        });

    } catch (error) {
        listaProductos.textContent = "Error al cargar los productos.";
    }
}

// Agregar producto
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const producto = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        precio: Number(document.getElementById("precio").value),
        imagen: document.getElementById("imagen").value,
        categoria: document.getElementById("categoria").value
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

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm("¿Quieres eliminar este producto?")) return;

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
}

// Editar producto
async function editarProducto(id) {
    const nombre = prompt("Nuevo nombre del producto:");
    if (nombre === null || nombre.trim() === "") return;

    const precio = Number(prompt("Nuevo precio:"));
    if (!Number.isFinite(precio) || precio <= 0) {
        alert("Ingresa un precio válido.");
        return;
    }

    const respuestaProducto = await fetch(`${API}/productos/${id}`);
    const producto = await respuestaProducto.json();

    const actualizado = {
        ...producto,
        nombre: nombre,
        precio: precio
    };

    const respuesta = await fetch(`${API}/productos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(actualizado)
    });

    if (respuesta.ok) {
        cargarProductos();
    } else {
        alert("No se pudo actualizar el producto.");
    }
}

// Cerrar sesión
document.getElementById("cerrarSesion").addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "admin.html";
});

verificarSesion();
cargarProductos();
