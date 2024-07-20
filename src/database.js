const mongoose  = require("mongoose");
const configObjetc = require("./config/config.js");
const {mongo_url} = configObjetc;

//Patron de diseño Singleton

class BaseDatos {
    static #instancia;

    constructor() {
        mongoose.connect(mongo_url);
    }

    static getInstancia(){
        if(this.#instancia) {
            console.log("Conexión previa");
            return this.#instancia;
        }

        this.#instancia = new BaseDatos();
        console.log("Conexión exitosa");
        return this.#instancia;
    }
}

module.exports = BaseDatos.getInstancia();