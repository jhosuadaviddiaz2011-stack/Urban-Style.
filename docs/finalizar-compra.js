const formulario = document.getElementById("formulario-compra");
const resumen = document.getElementById("resumen-pedido");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    resumen.textContent =
        "Las compras estarán disponibles próximamente. Estamos preparando la conexión segura para registrar pedidos.";
});
