import { Router } from 'express';
import { productsMongoManager } from "../dao/productsMongoManager.js";
import { productsModels } from '../dao/models/productsModels.js';
import { cartsMongoManager } from "../dao/cartsMongoManager.js"; // Importar el gestor de carritos

export const router = Router();

// Mostrar detalles de un producto
router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const producto = await productsModels.findById(pid).lean();
        if (!producto) {
            return res.status(404).render("404", { message: "Producto no encontrado" });
        }
        res.render("product-details", { producto });
    } catch (error) {
        console.error("Error al cargar producto:", error);
        res.status(500).json({ error: "Error al cargar producto" });
    }
});

// // Mostrar vista del carrito por ID
// router.get('/carts/:cartId', async (req, res) => {
//     const { cartId } = req.params;

//     try {
//         const cart = await cartsMongoManager.getById(cartId); // Obtener carrito por ID
//         if (!cart) {
//             return res.status(404).render("404", { message: "Carrito no encontrado" });
//         }
//         res.render("cartView", { productsCart: cart.products }); // Renderizar la vista con los productos del carrito
//     } catch (error) {
//         console.error("Error al cargar carrito:", error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// });

router.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts");
});

router.get("/products", async (req, res) => {
    try {
        let { page = 1, limit = 5, sort, category, available } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        let query = {};
        if (category) query.category = category;
        if (available !== undefined) query.status = available === "true";

        let sortOptions = {};
        if (sort === "asc") sortOptions.price = 1;
        else if (sort === "desc") sortOptions.price = -1;

        const totalProducts = await productsModels.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const productos = await productsModels
            .find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;

        res.render("products", {
            productos,
            hasPrevPage,
            hasNextPage,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            totalPages
        });
    } catch (error) {
        console.error("Error en GET /products:", error);
        res.status(500).send("Error interno");
    }
});

router.get('/carts/:cartId', async (req, res) => {
    const { cartId } = req.params;

    try {
        const cart = await cartsMongoManager.getById(cartId);
        if (!cart) {
            return res.status(404).render("404", { message: "Carrito no encontrado" });
        }
        res.render("cartView", { productsCart: cart.products, cartId });
    } catch (error) {
        console.error("Error al cargar carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

