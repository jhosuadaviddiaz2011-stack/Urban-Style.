
const API = "https://urban-style-rok5.onrender.com/api";

const formulario = document.getElementById("formulario-compra");
const resumen = document.getElementById("resumen-pedido");

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    let carrito = [];

    try {
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    } catch (error) {
        resumen.textContent = "No se pudo leer el carrito.";
        return;
    }

    if (!Array.isArray(carrito) || carrito.length === 0) {
        resumen.textContent = "Tu carrito está vacío.";
        return;
    }

    const datosPedido = {
        nombre_cliente: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        ciudad: document.getElementById("ciudad").value.trim(),
        productos: carrito.map(producto => ({
            id: Number(producto.id),
            cantidad: Number(producto.cantidad),
            talla: producto.talla
        }))
    };

    const boton = formulario.querySelector('button[type="submit"]');

    boton.disabled = true;
    boton.textContent = "REGISTRANDO PEDIDO...";
    resumen.textContent = "Estamos registrando tu pedido. Espera un momento.";

    try {
        const respuesta = await fetch(`${API}/pedidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosPedido)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || "No se pudo registrar el pedido.");
        }

        localStorage.removeItem("carrito");

        resumen.textContent =
            `¡PEDIDO CONFIRMADO!

            Número de pedido: ${resultado.pedidoId}

            Total: $${Number(resultado.total).toLocaleString("es-CO")} COP

            Gracias por comprar en URBAN STYLE.`;

        formulario.reset();

    } catch (error) {
        console.error("Error:", error);
        resumen.textContent = error.message;
    } finally {
        boton.disabled = false;
        boton.textContent = "CONFIRMAR PEDIDO";
    }
});
