const CartModel = require("../models/cart.model.js");


class CartServices {

    async crearCart(datosCart) {
        try {
            const cart = new CartModel(datosCart);
            return await cart.save();
        } catch (error) {
            throw new Error("Error al crear carrito");
    }
}

    async obtenerCarts() {
            try {
                return await CartModel.find();
            } catch (error) {
                throw new Error("Error al obtener el listado de carritos");
            }
        }
    
}
module.exports = CartServices;