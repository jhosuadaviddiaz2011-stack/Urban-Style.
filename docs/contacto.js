const formulario = document.getElementById("formulario-contacto");
const respuesta = document.getElementById("respuesta-contacto");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    respuesta.textContent =
        "El servicio de contacto estará disponible próximamente. Gracias por tu interés en URBAN STYLE.";

    formulario.reset();
});
