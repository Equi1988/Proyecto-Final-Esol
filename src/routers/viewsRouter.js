// import { Router } from 'express';
// import { productsMongoManager } from "../dao/productsMongoManager.js";
// import { productsModels } from '../dao/models/productsModels.js';


// export const router = Router ()

// router.get('/products',async(req,res)=>{

//     let productos=await productsMongoManager.get()
//     console.log(productos)
    
//     res.render("products", {
//         productos
//     })
// })

// router.get('/products/:pid', async (req, res) => {
//     const { pid } = req.params;
//     console.log("ID recibido:", pid); // Depura el ID recibido

//     try {
//         const producto = await productsModels.findById(pid).lean();
//         console.log("Producto encontrado:", producto); // Depura el resultado de la consulta
//         if (!producto) {
//             return res.status(404).render("404", { message: "Producto no encontrado" });
//         }
//         res.render("product-details", { producto });
//     } catch (error) {
//         console.error("Error al cargar producto:", error);
//         res.status(500).json({ error: "Error al cargar producto" });
//     }
// });

import { Router } from 'express';
import { productsMongoManager } from "../dao/productsMongoManager.js";
import { productsModels } from '../dao/models/productsModels.js';
import { cartsMongoManager } from "../dao/cartsMongoManager.js"; // Importar el gestor de carritos

export const router = Router();

// Mostrar todos los productos en una vista
router.get('/products', async (req, res) => {
    try {
        const productos = await productsMongoManager.get();
        res.render("products", { productos });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        res.status(500).json({ error: "Error al cargar productos" });
    }
});

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

// Mostrar vista del carrito por ID
router.get('/carts/:cartId', async (req, res) => {
    const { cartId } = req.params;

    try {
        const cart = await cartsMongoManager.getById(cartId); // Obtener carrito por ID
        if (!cart) {
            return res.status(404).render("404", { message: "Carrito no encontrado" });
        }
        res.render("cartView", { productsCart: cart.products }); // Renderizar la vista con los productos del carrito
    } catch (error) {
        console.error("Error al cargar carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

