const formularioContacto = document.getElementById("formulario-contacto");

const respuestaContacto = document.getElementById("respuesta-contacto");


formularioContacto.addEventListener("submit", function(event) {

    event.preventDefault();


    const nombre = document.getElementById("nombre-contacto").value;
    const correo = document.getElementById("correo-contacto").value;
    const mensaje = document.getElementById("mensaje-contacto").value;


    respuestaContacto.textContent =
        "Gracias, " + nombre + ". Tu mensaje ha sido recibido.";


    formularioContacto.reset();


    console.log("Nombre:", nombre);
    console.log("Correo:", correo);
    console.log("Mensaje:", mensaje);

});
