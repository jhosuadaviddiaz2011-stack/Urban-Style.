
const API = "https://urban-style-rok5.onrender.com/api";

const formulario = document.getElementById("formulario-contacto");
const respuesta = document.getElementById("respuesta-contacto");

formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre-contacto").value.trim(),
        correo: document.getElementById("correo-contacto").value.trim(),
        mensaje: document.getElementById("mensaje-contacto").value.trim()
    };

    const boton = formulario.querySelector('button[type="submit"]');

    boton.disabled = true;
    respuesta.textContent = "Enviando mensaje...";

    try {
        const resultado = await fetch(`${API}/contacto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const contenido = await resultado.json();

        if (!resultado.ok) {
            throw new Error(contenido.mensaje || "No se pudo enviar el mensaje.");
        }

        respuesta.textContent = "¡Mensaje enviado correctamente!";
        formulario.reset();

    } catch (error) {
        console.error(error);
        respuesta.textContent = error.message;

    } finally {
        boton.disabled = false;
    }
});
