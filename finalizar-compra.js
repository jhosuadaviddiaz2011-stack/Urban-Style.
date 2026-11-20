
const API = "http://localhost:3000/api";

const formulario = document.getElementById("formulario-compra");
const resumen = document.getElementById("resumen-pedido");

formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        resumen.textContent = "Tu carrito está vacío.";
        return;
    }

    const datos = {
        nombre_cliente: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        ciudad: document.getElementById("ciudad").value.trim(),
        productos: carrito.map(producto => ({
            id: Number(producto.id),
            cantidad: Number(producto.cantidad)
        }))
    };

    const boton = formulario.querySelector('button[type="submit"]');

    boton.disabled = true;
    boton.textContent = "REGISTRANDO PEDIDO...";
    resumen.textContent = "Registrando tu pedido...";

    try {
        const respuesta = await fetch(`${API}/pedidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || resultado.error || "No se pudo registrar el pedido.");
        }

        localStorage.removeItem("carrito");

        formulario.style.display = "none";
        resumen.innerHTML = "";

        const titulo = document.createElement("h2");
        titulo.textContent = "¡PEDIDO REGISTRADO!";

        const mensaje = document.createElement("p");
        mensaje.textContent = "Gracias por comprar en URBAN STYLE.";

        const detalle = document.createElement("p");
        detalle.textContent = resultado.mensaje || "Tu pedido fue registrado correctamente.";

        const enlace = document.createElement("a");
        enlace.href = "catalogo.html";
        enlace.className = "boton-principal";
        enlace.textContent = "SEGUIR COMPRANDO";

        resumen.append(titulo, mensaje, detalle, enlace);

        resumen.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {
        console.error(error);
        resumen.textContent = error.message || "Error al registrar el pedido.";
        boton.disabled = false;
        boton.textContent = "CONFIRMAR PEDIDO";
    }
});
