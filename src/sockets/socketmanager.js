// //const socket = require("socket.io");
// const socket = require("socket.io");
// const ProductRepository = require("../repositories/products.repository.js");
// const productRepository = new ProductRepository(); 
// const MessageModel = require("../models/message.model.js");

// class SocketManager {
//     constructor(httpServer) {
//         this.io = socket(httpServer);
//         this.initSocketEvents();
//     }

//     async initSocketEvents() {
//         this.io.on("connection", async (socket) => {
//             console.log("Un cliente se conectó");
            
//             socket.emit("productos", await productRepository.obtenerProductos() );

//             socket.on("eliminarProducto", async (id) => {
//                 await productRepository.eliminarProducto(id);
//                 this.emitUpdatedProducts(socket);
//             });

//             socket.on("agregarProducto", async (producto) => {
//                 await productRepository.agregarProducto(producto);
//                 this.emitUpdatedProducts(socket);
//             });

//             socket.on("message", async (data) => {
//                 await MessageModel.create(data);
//                 const messages = await MessageModel.find();
//                 socket.emit("message", messages);
//             });
//         });
//     }

//     async emitUpdatedProducts(socket) {
//         socket.emit("productos", await productRepository.obtenerProductos());
//     }
// }

// module.exports = SocketManager;

const socket = require("socket.io");
const ProductRepository = require("../repositories/products.repository.js");
const productRepository = new ProductRepository();
const MessageModel = require("../models/message.model.js");

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Admin conectado");

            try {
                const productos = await productRepository.obtenerProductos();
                socket.emit("productos", productos);
            } catch (error) {
                console.error("Error al obtener productos:", error);
                socket.emit("error", "Error al obtener productos");
            }

            socket.on("eliminarProducto", async (id) => {
                try {
                    await productRepository.eliminarProducto(id);
                    this.emitUpdatedProducts();
                } catch (error) {
                    console.error("Error al eliminar producto:", error);
                    socket.emit("error", "Error al eliminar producto");
                }
            });

            socket.on("agregarProducto", async (producto) => {
                try {
                    await productRepository.agregarProducto(producto);
                    this.emitUpdatedProducts();
                } catch (error) {
                    console.error("Error al agregar producto:", error);
                    socket.emit("error", "Error al agregar producto");
                }
            });

            socket.on("message", async (data) => {
                try {
                    await MessageModel.create(data);
                    const messages = await MessageModel.find();
                    this.io.emit("message", messages);
                } catch (error) {
                    console.error("Error al manejar mensaje:", error);
                    socket.emit("error", "Error al manejar mensaje");
                }
            });
        });
    }

    async emitUpdatedProducts() {
        try {
            const productos = await productRepository.obtenerProductos();
            this.io.emit("productos", productos);
        } catch (error) {
            console.error("Error al emitir productos actualizados:", error);
            this.io.emit("error", "Error al emitir productos actualizados");
        }
    }
}

module.exports = SocketManager;
