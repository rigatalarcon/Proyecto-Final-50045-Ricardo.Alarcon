const bcrypt = require("bcrypt");
const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
const isValidPassword = (password, user) => bcrypt.compareSync(password, user.password);
//Compara los password, retorna true o falsete segun corresponda. 

module.exports = {
    createHash, 
    isValidPassword
}