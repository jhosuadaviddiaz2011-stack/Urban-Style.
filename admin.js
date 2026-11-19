
const formulario = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    try {
        const respuesta = await fetch(
            "http://localhost:3000/api/admin/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: usuario,
                    password: password
                })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje;
            return;
        }

        sessionStorage.setItem("adminToken", datos.token);

        mensaje.textContent = "Inicio de sesión correcto";

        window.location.href = "panel-admin.html";

    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor";
    }
});
