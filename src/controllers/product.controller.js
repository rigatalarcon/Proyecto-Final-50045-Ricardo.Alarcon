const ProductRepository = require("../repositories/products.repository.js");
const productRepository = new ProductRepository();

class ProductController {

    async addProduct(req, res) {
        const newProduct = req.body;

        try {
            await productRepository.agregarProducto(newProduct);
            
            newProduct.getElementById('productForm').reset();
        } catch (error) {
            res.status(500).send("Error al agregar producto");
        }
    }

    async getProduct(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;

            const products = await productRepository.obtenerProductos(limit, page, sort, query);

            res.status(200).json(products);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async getProductById(req, res) {
        const id = req.params.pid;
        try {
            const buscado = await productRepository.obtenerProductoPorId(id);
            if (!buscado) {
                return res.json({
                    error: "Producto no encontrado"
                });
            }
            res.json(buscado);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid;
            const productoActualizado = req.body;

            const resultado = await productRepository.actualizarProducto(id, productoActualizado);
            res.json(resultado);
        } catch (error) {
            res.status(500).send("Error al actualizar el producto");
        }
    }

    async deleteProduct(req, res) {
        const id = req.params.pid;
        try {
            let respuesta = await productRepository.eliminarProducto(id);

            res.json(respuesta);
        } catch (error) {
            res.status(500).send("Error al eliminar el producto");
        }
    }
}

module.exports = ProductController; 