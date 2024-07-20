const dotenv = require("dotenv");
const program = require("../utils/commander.js");

const {mode} = program.opts();

dotenv.config({
    path: mode === "produccion" ? "./.env.produccion" : "./.env.desarrollo"// variable de entorno
});

const configObjetc = {
    mongo_url: process.env.MONGO_URL
}

module.exports = configObjetc;
