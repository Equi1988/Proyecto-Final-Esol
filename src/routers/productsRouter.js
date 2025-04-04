import { Router } from "express";
import { procesaErrores } from "../utils.js";
import { productsModels } from "../dao/models/productsModels.js";
import { productsMongoManager } from "../dao/productsMongoManager.js";
import {isValidObjectId} from 'mongoose';

export const router = Router ()

router.get("/", async (req, res) => {
    try {
        let { page = 1, limit = 5, sort, category, available } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        let query = {};

        // Filtrar por categoría si se proporciona
        if (category) {
            query.category = category;
        }

        // Filtrar por disponibilidad (status: true o false)
        if (available !== undefined) {
            query.status = available === "true"; // Convierte el string a booleano
        }

        // Configurar ordenamiento
        let sortOptions = {};
        if (sort === "asc") {
            sortOptions.price = 1; // Orden ascendente
        } else if (sort === "desc") {
            sortOptions.price = -1; // Orden descendente
        }

        // Obtener productos con filtros, paginación y ordenamiento
        let totalProducts = await productsModels.countDocuments(query);
        let totalPages = Math.ceil(totalProducts / limit);

        let products = await productsModels
            .find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Construcción de paginación
        let hasPrevPage = page > 1;
        let hasNextPage = page < totalPages;

        let prevLink = hasPrevPage
            ? `/api/products?page=${page - 1}&limit=${limit}&sort=${sort || ""}&category=${category || ""}&available=${available || ""}`
            : null;

        let nextLink = hasNextPage
            ? `/api/products?page=${page + 1}&limit=${limit}&sort=${sort || ""}&category=${category || ""}&available=${available || ""}`
            : null;

        res.status(200).json({
            status: "success",
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        console.error("Error en GET /api/products:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor", error: error.message });
    }
});

router.post("/", async (req,res)=>{
    let{title, description, code, price, stock, category, thumbnails}= req.body
    if(!title ||  !code || !price ){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error:`title | code | price son requeridos`})
    }

    // realizar otras validaciones :)

    try {
        let existe = await productsMongoManager.getBy ({code})
        if (existe){
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error:`Ya existe producto con ${code} en DB`})
        }

        let nuevoProducto = await productsMongoManager.save({title, description, code, price, stock, category, thumbnails})
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({message: "Producto generado", nuevoProducto});
    } catch (error) {
        procesaErrores(error, res)
    }
})

router.put ("/:id", async (req,res)=>{
    let aModificar = req.body
    let {id} = req.params
    if (!isValidObjectId (id)){
        res.setHeader('Content-Type', 'application/json');
        return res.status (400).json({error: `Ingrese un Id valido de MongoDB`})
    }

    //validaciones (ejemplo que no genere un code repetido)

    try {

        let productsModificado = await productsMongoManager.update(id, aModificar)
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({message: "Producto Modificado", productsModificado});
        
    } catch (error) {
        procesaErrores(error, res)
    }
})

router.delete("/:id", async (req, res) => {
    let { id } = req.params;

    // Verificar si el ID es válido en MongoDB
    if (!isValidObjectId(id)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: "Ingrese un ID válido de MongoDB" });
    }

    try {
        let productoEliminado = await productsMongoManager.delete(id);

        if (!productoEliminado) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ message: "Producto eliminado correctamente" });

    } catch (error) {
        procesaErrores(error, res);
    }
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const producto = await productsMongoManager.getById(pid); // Llamada al método getById
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(200).json({ producto });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



