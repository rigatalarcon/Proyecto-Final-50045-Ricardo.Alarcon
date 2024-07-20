const express = require("express");
const { generarInfoError } = require("../services/errors/info.js");
const { EErrors } = require("../services/errors/enum.js");

const router = express.Router();
const UserModel = require("../models/user.model.js"); 

class CustomError {
    static crearError({nombre = "Error", causa = "Desconocido", mensaje, codigo = 1}){
        const error = new Error(mensaje); 
        error.name = nombre;
        error.causa = causa;
        error.code = codigo;
        throw error; 
        //Lanzamos el error, esto detiene la ejecución de la app, por eso debemos capturarlo en el otro módulo. 
    }

}

module.exports = CustomError;