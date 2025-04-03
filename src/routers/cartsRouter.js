import { Router } from "express";
import { procesaErrores } from "../utils.js";
import { cartsMongoManager } from "../dao/cartsMongoManager.js";
import { productsModels } from "../dao/models/productsModels.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

export const router = Router();


router.get("/", async (req, res) => {
    try {
        res.status(200).json({ message: "Rutas de carritos funcionando correctamente" });
    } catch (error) {
        procesaErrores(error, res);
    }
});

router.get('/carts/:cartId', async (req, res) => {
    const { cartId } = req.params;
    console.log(`Solicitud recibida para carrito: ${cartId}`);

    try {
        const cart = await cartsMongoManager.getById(cartId).populate("products.product").lean();
        console.log("Carrito obtenido:", cart); // Depuración

        if (!cart) {
            return res.status(404).render("404", { message: "Carrito no encontrado" });
        }

        res.render("cartView", { productsCart: cart.products });
    } catch (error) {
        console.error("Error al cargar carrito:", error);
        res.status(500).render("500", { message: "Error interno del servidor" });
    }
});


router.get("/:cid/products/:pid", async (req, res) => {
    let { cid, pid } = req.params;

    // Validar IDs
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: "ID de carrito o producto no válido" });
    }

    try {
        // Buscar el carrito con los productos poblados
        let carrito = await cartsMongoManager.getById(cid);
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Verificar si carrito.products es un array
        if (!Array.isArray(carrito.products)) {
            return res.status(500).json({ error: "Estructura del carrito incorrecta" });
        }

        // Buscar el producto dentro del carrito
        let productoEnCarrito = carrito.products.find(p => p.product?._id.toString() === pid);

        if (!productoEnCarrito) {
            return res.status(404).json({ error: "Producto no encontrado en el carrito" });
        }

        res.status(200).json({ producto: productoEnCarrito.product });
    } catch (error) {
        console.error("Error en GET /api/carts/:cid/products/:pid:", error);
        res.status(500).json({ error: "Error interno del servidor", detalles: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        console.log("Body recibido en POST:", req.body);

        // Asegurar que `productos` sea un array, si no existe, se inicializa vacío
        let productos = req.body.productos || [];

        if (!Array.isArray(productos)) {
            return res.status(400).json({ error: "Debe proporcionar un arreglo de productos" });
        }

        let nuevoCarrito = await cartsMongoManager.save({ products: productos });

        res.status(201).json({ message: "Carrito creado correctamente", nuevoCarrito });
    } catch (error) {
        console.error("Error en POST /api/carts:", error);
        res.status(500).json({ error: "Error al crear el carrito", detalles: error.message });
    }
});



// Crear un nuevo carrito
router.put("/:cartId", async (req, res) => {
    try {
        const { cartId } = req.params;
        let { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ error: "Debe enviar un arreglo de productos" });
        }

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ error: "ID de carrito no válido" });
        }

        const carrito = await cartsMongoManager.getById(cartId);
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // ✅ Validar que los productos existan antes de agregarlos
        for (const item of products) {
            const productExists = await productsModels.findById(item.product);
            if (!productExists) {
                return res.status(404).json({ error: `Producto con ID ${item.product} no encontrado.` });
            }
        }

        const updatedCart = await cartsMongoManager.update(cartId, { products });

        res.status(200).json({ message: "Carrito actualizado correctamente", carrito: updatedCart });
    } catch (error) {
        console.error("Error en PUT /api/carts/:cartId:", error);
        res.status(500).json({ error: "Error al actualizar el carrito", detalles: error.message });
    }
});

// Agregar producto al carrito usando cartId y productId
router.post("/:cartId/products/:productId", async (req, res) => {
    const { cartId, productId } = req.params;

    // Validar IDs
    if (!isValidObjectId(cartId) || !isValidObjectId(productId)) {
        return res.status(400).json({ error: "ID de carrito o producto inválido" });
    }

    try {
        // Obtener carrito por ID
        const cart = await cartsMongoManager.getById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Agregar el producto al carrito
        const updatedCart = await cartsMongoManager.addProduct(cartId, productId);
        res.status(200).json({ message: "Producto agregado al carrito correctamente", cart: updatedCart });
    } catch (error) {
        console.error("Error en POST /api/carts/:cartId/products/:productId:", error);
        res.status(500).json({ error: "Error interno del servidor", detalles: error.message });
    }
});

// Obtener todos los productos del carrito con populate
router.get("/:cid", async (req, res) => {
    let { cid } = req.params;
    try {
        let carrito = await cartsMongoManager.getById(cid);
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json({ carrito });
    } catch (error) {
        procesaErrores(error, res);
    }
});
        
router.put("/:cartId", async (req, res) => {
    try {
        const { cartId } = req.params;
        let { products } = req.body;

        // Validar si el cartId es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ error: "ID de carrito inválido" });
        }

        // Validar que products sea un array
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: "Debe enviar un arreglo de productos" });
        }

        // Buscar el carrito antes de actualizarlo
        const carrito = await cartsMongoManager.getById(cartId);
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Actualizar el carrito con los nuevos productos
        const updatedCart = await cartsMongoManager.update(cartId, { products });

        res.status(200).json({ message: "Carrito actualizado correctamente", carrito: updatedCart });
    } catch (error) {
        console.error("Error en PUT /api/carts/:cartId:", error);
        res.status(500).json({ error: "Error al actualizar el carrito", detalles: error.message });
    }
});



// Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
    let { cid } = req.params;
    let { products } = req.body;
    if (!Array.isArray(products)) {
        return res.status(400).json({ error: "Debe enviar un arreglo de productos" });
    }
    try {
        let carrito = await cartsMongoManager.update(cid, { products });
        if (!isValidObjectId(cid)) {
            return res.status(400).json({ error: "ID de carrito inválido" });
        }
        res.status(200).json({ message: "Productos actualizados en el carrito", carrito });
    } catch (error) {
        procesaErrores(error, res);
    }
});


// Actualizar la cantidad de un producto en el carrito
router.put("/:cartId/products/:productId", async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    try {
        const carritoActualizado = await cartsMongoManager.updateProductQuantity(cartId, productId, quantity);
        res.status(200).json({ message: "Producto agregado/actualizado correctamente", carrito: carritoActualizado });
    } catch (error) {
        console.error("Error en PUT /api/carts/:cartId/products/:productId:", error);
        res.status(500).json({ error: "Error al actualizar el carrito", detalles: error.message });
    }
});


// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    let { cid, pid } = req.params;

    try {
        let carrito = await cartsMongoManager.removeProduct(cid, pid);
        res.status(200).json({ message: "Producto eliminado del carrito", carrito });
    } catch (error) {
        procesaErrores(error, res);
    }
});

// Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
    let { cid } = req.params;

    try {
        let carrito = await cartsMongoManager.clearCart(cid);
        res.status(200).json({ message: "Todos los productos eliminados del carrito", carrito });
    } catch (error) {
        procesaErrores(error, res);
    }
});

router.delete("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        let cart = await cartsMongoManager.getById(cid);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        console.log("Carrito antes de eliminar:", JSON.stringify(cart, null, 2)); // 🔍 LOG para depurar

        // Filtrar solo los productos válidos antes de eliminar
        cart.products = cart.products.filter(item => item?.product && item.product.toString() !== pid);

        await cartsMongoManager.update(cid, { products: cart.products });

        res.status(200).json({ message: "Producto eliminado del carrito", carrito: cart });
    } catch (error) {
        console.error("Error en DELETE /api/carts/:cid/product/:pid:", error);
        res.status(500).json({ error: "Error al eliminar el producto", detalles: error.message });
    }
});

