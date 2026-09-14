const API_URL = 'http://localhost:3001/products';

let etag = null;
let productosCache = [];

const btnConsultar = document.getElementById('btnConsultar');
const statusElement = document.getElementById('status');
const etagElement = document.getElementById('etag');
const mensajeElement = document.getElementById('mensaje');
const productosElement = document.getElementById('productos');


btnConsultar.addEventListener('click', consultarProductos);


async function consultarProductos() {

    const headers = {};

    /*
     * Si ya tenemos un ETag almacenado,
     * lo enviamos al servidor.
     */
    if (etag) {
        headers['If-None-Match'] = etag;
    }

    try {

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: headers
        });

        mostrarStatus(response.status);

        /*
         * HTTP 304:
         *
         * El recurso no ha cambiado.
         * El servidor no devuelve nuevamente el cuerpo.
         */
        if (response.status === 304) {

            mensajeElement.textContent =
                'El recurso no ha cambiado. Se utilizan los datos obtenidos anteriormente.';

            mostrarProductos(productosCache);

            return;
        }

        /*
         * HTTP 200:
         *
         * Obtenemos nuevamente los datos.
         */
        if (response.status === 200) {

            const productos = await response.json();

            /*
             * Recuperamos el ETag enviado por el servidor.
             */
            etag = response.headers.get('ETag');

            /*
             * Guardamos localmente los datos.
             */
            productosCache = productos;

            etagElement.textContent = etag || 'No recibido';

            mensajeElement.textContent =
                'El recurso fue recibido desde el servidor.';

            mostrarProductos(productos);

            return;
        }

        mensajeElement.textContent =
            'El servidor respondió con un estado inesperado.';

    } catch (error) {

        console.error(error);

        statusElement.textContent = 'Error';

        mensajeElement.textContent =
            'No fue posible conectarse con el backend.';
    }
}


function mostrarStatus(status) {

    statusElement.className = '';

    if (status === 200) {

        statusElement.textContent = '200 OK';
        statusElement.classList.add('status-200');

    } else if (status === 304) {

        statusElement.textContent = '304 Not Modified';
        statusElement.classList.add('status-304');

    } else {

        statusElement.textContent = status;
    }
}


function mostrarProductos(productos) {

    productosElement.innerHTML = '';

    productos.forEach(producto => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.name}</td>
        `;

        productosElement.appendChild(row);
    });
}