const TicketModel = require("../models/ticket.model.js");
const UserModel = require("../models/user.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const ProductRepository = require("../repositories/products.repository.js");
const productRepository = new ProductRepository();
const { generateUniqueCode, calcularTotal } = require("../utils/cartutils.js");
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();
const TicketRepository = require("../repositories/ticket.repository.js");
const ticketRepository = new TicketRepository();

class CartController {
    async nuevoCarrito(req, res) {
        try {
            const nuevoCarrito = await cartRepository.crearCarrito();
            res.json(nuevoCarrito);
        } catch (error) {
            res.status(500).json({ error: "Error al crear el carrito" });
        }
    }

    async obtenerProductosDeCarrito(req, res) {
        const cartId = req.params.cid;
        try {
            const productos = await cartRepository.obtenerProductosDeCarrito(cartId);
            if (!productos) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los productos del carrito" });
        }
    }

    async agregarProductoEnCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        try {
            await cartRepository.agregarProducto(cartId, productId, quantity);
            const carritoID = (req.user.cart).toString();

            res.redirect(`/carts/${carritoID}`)
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    

    async eliminarProductoDeCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        try {
            const updatedCart = await cartRepository.eliminarProducto(cartId, productId);

            if (!updatedCart) {
                return res.status(404).json({ error: "Carrito o producto no encontrado" });
            }

            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito correctamente',
                updatedCart,
            });
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            res.status(500).json({ error: "Error al eliminar producto del carrito" });
        }
    }

    async actualizarProductosEnCarrito(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;

        if (!Array.isArray(updatedProducts)) {
            return res.status(400).json({ error: "El cuerpo de la solicitud debe ser un arreglo de productos" });
        }

        try {
            const updatedCart = await cartRepository.actualizarProductosEnCarrito(cartId, updatedProducts);

            if (!updatedCart) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            res.json(updatedCart);
        } catch (error) {
            console.error("Error al actualizar productos en el carrito:", error);
            res.status(500).json({ error: "Error al actualizar productos en el carrito" });
        }
    }

    async actualizarCantidad(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;

        if (newQuantity <= 0) {
            return res.status(400).json({ error: "La cantidad debe ser mayor que cero" });
        }

        try {
            const updatedCart = await cartRepository.actualizarCantidadesEnCarrito(cartId, productId, newQuantity);

            if (!updatedCart) {
                return res.status(404).json({ error: "Carrito o producto no encontrado" });
            }

            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada correctamente',
                updatedCart,
            });
        } catch (error) {
            console.error("Error al actualizar la cantidad de productos:", error);
            res.status(500).json({ error: "Error al actualizar la cantidad de productos" });
        }
    }

    async vaciarCarrito(req, res) {
        const cartId = req.params.cid;
        try {
            const updatedCart = await cartRepository.vaciarCarrito(cartId);

            if (!updatedCart) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            res.json({
                status: 'success',
                message: 'Todos los productos del carrito fueron eliminados correctamente',
                updatedCart,
            });
        } catch (error) {
            console.error("Error al vaciar el carrito:", error);
            res.status(500).json({ error: "Error al vaciar el carrito" });
        }
    }

    async finalizarCompra(req, res) {
        const cartId = req.params.cid;
        try {
            const cart = await cartRepository.obtenerProductosDeCarrito(cartId);
            const products = cart.products;

            if (!products || products.length === 0) {
                // Si el carrito está vacío, devolver una respuesta apropiada.
                return res.status(400).json({ error: 'El carrito está vacío. No se puede finalizar la compra.' });
            }
            const productosNoDisponibles = [];

            for (const item of products) {
                const productId = item.product;
                const product = await productRepository.obtenerProductoPorId(productId);
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    productosNoDisponibles.push(productId);
                }
            }

            const userWithCart = await UserModel.findOne({ cart: cartId });
            
            const ticket = await ticketRepository.crearTicket({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calcularTotal(cart.products),
                purchaser: userWithCart._id,
                products: cart.products
            });

            await cartRepository.vaciarCarrito(cartId);

            await emailManager.enviarCorreoCompra(userWithCart.email, userWithCart.first_name, ticket._id);

            res.render("checkout", {
                cliente: userWithCart.first_name,
                email: userWithCart.email,
                numTicket: ticket._id
            });
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

}

module.exports = CartController;


