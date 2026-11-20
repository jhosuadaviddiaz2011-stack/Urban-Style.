
const API = "http://localhost:3000/api";

const formularioContacto = document.getElementById("formulario-contacto");
const respuestaContacto = document.getElementById("respuesta-contacto");

formularioContacto.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre-contacto").value.trim();
    const correo = document.getElementById("correo-contacto").value.trim();
    const mensaje = document.getElementById("mensaje-contacto").value.trim();

    const boton = formularioContacto.querySelector('button[type="submit"]');

    boton.disabled = true;
    boton.textContent = "ENVIANDO...";

    respuestaContacto.textContent = "Enviando tu mensaje...";

    try {
        const respuesta = await fetch(`${API}/contacto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                correo,
                mensaje
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || resultado.error || "No se pudo enviar el mensaje."
            );
        }

        respuestaContacto.textContent =
            "¡Gracias, " + nombre + "! Tu mensaje fue enviado correctamente.";

        formularioContacto.reset();

    } catch (error) {
        console.error("Error:", error);

        respuestaContacto.textContent =
            error.message || "No se pudo conectar con el servidor. Inténtalo nuevamente.";

    } finally {
        boton.disabled = false;
        boton.textContent = "ENVIAR MENSAJE";
    }
});
