console.log("JAVASCRIPT DE COMPRA CONECTADO");

const formulario = document.getElementById("formulario-compra");


const resumen = document.getElementById("resumen-pedido");


formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;
    const ciudad = document.getElementById("ciudad").value;



const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let total = 0;

carrito.forEach(function(producto) {
    total += producto.precio * producto.cantidad;
});


resumen.innerHTML = `
    <h2>RESUMEN DE TU PEDIDO</h2>

    <h3>DATOS DEL CLIENTE</h3>
    <p>Nombre: ${nombre}</p>
    <p>Correo: ${correo}</p>
    <p>Teléfono: ${telefono}</p>
    <p>Dirección: ${direccion}</p>
    <p>Ciudad: ${ciudad}</p>

    <h3>PRODUCTOS</h3>

    ${carrito.map(function(producto) {
        return `

            <div>
                <p>${producto.nombre}</p>
                <p>Talla: ${producto.talla}</p>
                <p>Cantidad: ${producto.cantidad}</p>
                <p>Precio: $${producto.precio.toLocaleString("es-CO")} COP</p>
            </div>
        `;
    }).join("")}

    <h2>TOTAL: $${total.toLocaleString("es-CO")} COP</h2>

    <button id="confirmar-pedido" class="boton-principal">
        CONFIRMAR PEDIDO
    </button>
`;

const botonConfirmar = document.getElementById("confirmar-pedido");

botonConfirmar.addEventListener("click", function() {

    const numeroPedido = Math.floor(Math.random() * 90000) + 10000;

    resumen.innerHTML = `
        <h2>¡PEDIDO CONFIRMADO!</h2>
        <p>Gracias por comprar en URBAN STYLE.</p>
        <p>Número de pedido: #${numeroPedido}</p>
        <p>Tu pedido ha sido registrado correctamente.</p>
        <a href="catalogo.html" class="boton-principal">
            SEGUIR COMPRANDO
        </a>
    `;

    localStorage.removeItem("carrito");

});

});
