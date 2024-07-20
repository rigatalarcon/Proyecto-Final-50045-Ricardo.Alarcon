const CartModel = require("../models/cart.model.js");
const TicketModel = require("../models/ticket.model.js");


class CartRepository {
    async crearCarrito() {
        try {
            const nuevoCarrito = new CartModel({ Product: [] });
            await nuevoCarrito.save();
            return nuevoCarrito;
        } catch (error) {
            throw new Error("hola soy un Error");
        }
    }

    async obtenerProductosDeCarrito(cartId) {
        try {
            const carrito = await CartModel.findById(cartId);
            if (!carrito) {
                console.log("No existe ese carrito con Id");
                return null;
            }
            return carrito;
        } catch (error) {
            throw new Error("otro error");

        }
    }

    async agregarProducto(cartId, productId, quantity = 1) {
        try {
            // Obtener el carrito actual
            let carrito = await this.obtenerProductosDeCarrito(cartId);
    
            // Verificar si el producto ya existe en el carrito
            const existeProducto = carrito.products.find(item => item.product.toString() === productId);
    
            if (existeProducto) {
                // Si el producto existe, actualizar la cantidad
                existeProducto.quantity += quantity;
            } else {
                // Si el producto no existe, agregarlo al carrito
                carrito.products.push({ product: productId, quantity });
            }
    
            // Marcar la propiedad "products" como modificada
            carrito.markModified('products');
    
            // Guardar el carrito actualizado
            carrito = await carrito.save();
            return carrito;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error; // Relanzar el error para manejarlo en el controlador
        }
    }
    
    
    

    async eliminarProducto(cartId, productId) {
        try {
            const cart = await CartModel.findById(cart);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            cart.products = cart.products.filter(item => item.product._id.toString() !== productId);
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Error");
        }
    }

    async actualizarProductosEnCarrito(cartId, updatedProducts) {
        try {
            console.log(updatedProducts);
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = updatedProducts;

            cart.markModified('products');
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Error");
        }
    }

    async actualizarCantidadesEnCarrito(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                
                throw new Error('Carrito no encontrado');
            }
            
            
            const productIndex = cart.products.findIndex(item => item._id.toString() === productId);
        
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity;
                cart.markModified('products');
                await cart.save();
                return cart;
            } else {
                throw new Error('Producto no encontrado en el carrito');
            }

        } catch (error) {
            throw new Error("Error al actualizar las cantidades");
        }
    }

    async vaciarCarrito(cartId) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            return cart;

        } catch (error) {
            throw new Error("sere yo el Error");
        }
    }

    async agregarProductosATicket(products, purchaser) {
        try {
            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calcularTotal(products),
                purchaser
            });
            await ticket.save();
            return ticket;
        } catch (error) {
            throw new Error("Error");
        }
    }

}

module.exports = CartRepository;


