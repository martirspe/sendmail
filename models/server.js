const express = require('express')
const cors = require('cors');
const { json, urlencoded } = require('body-parser'); // Sirve para enviar los correos desde un host remoto.
const sendMail = require('../routes/email.route');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.API_PORT || 8000;
        this.route = '/' + process.env.API_ROUTE;

        // Middlewares
        this.middlewares();

        // Rutas
        this.routes();
    }

    middlewares() {
        // Cors
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));

        // Directorio público
        this.app.use(express.static('public'));
    }

    routes() {
        this.app.use(this.route, sendMail);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Server on port: ', this.port)
        });
    }
}
module.exports = Server;