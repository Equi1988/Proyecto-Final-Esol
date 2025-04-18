import mongoose from "mongoose";
import { cartsModels } from "./models/cartsModels.js";
import { productsModels } from "./models/productsModels.js";


export class cartsMongoManager {
    static async get() {
        return await cartsModels.find().lean();
    }

    async getById(id) {
        return await cartModel.findById(id).populate("products.product").lean();
    }
    
    static async save(cart) {
        return await cartsModels.create({
            products: Array.isArray(cart.products) ? cart.products.map(product => ({
                product: product.product,
                quantity: product.quantity
            })) : []
        });
    }
    
    static async update(id, aModificar) {
        return await cartsModels.findByIdAndUpdate(id, aModificar, { new: true }).lean();
    }

    static async delete(id) {
        return await cartsModels.findByIdAndDelete(id).lean();
    }

    static async getById(cartId) {
        try {
            let carrito = await cartsModels.findById(cartId).populate("products.product").lean();
            if (!carrito) throw new Error("Carrito no encontrado");
            return carrito;
        } catch (error) {
            console.error("Error en getById:", error);
            throw error;
        }
    }

    static async updateProductQuantity(cartId, productId, quantity) {
        let carrito = await cartsModels.findById(cartId);
        if (!carrito) throw new Error("Carrito no encontrado");

        let productInCart = carrito.products.find(
            (item) => item.product.toString() === productId
        );

        if (productInCart) {
            productInCart.quantity = quantity;
        } else {
            carrito.products.push({ product: productId, quantity });
        }

        await carrito.save();
        return carrito;
    }

    static async clearCart(cartId) {
        let carrito = await cartsModels.findById(cartId);
        if (!carrito) throw new Error("Carrito no encontrado");

        carrito.products = [];
        await carrito.save();
        return carrito;
    }
    static async addProduct(cartId, productId) {
        try {
            const cart = await cartsModels.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado.");
            }
    
            // ✅ Verificar si el producto existe en la base de datos antes de agregarlo
            const productExists = await productsModels.findById(productId);
            if (!productExists) {
                throw new Error(`Producto con ID ${productId} no encontrado.`);
            }
    
            const productInCart = cart.products.find(item => item.product.toString() === productId);
    
            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }
    
            await cart.save();
            return await cartsModels.findById(cartId).populate("products.product").lean();
        } catch (error) {
            console.error("Error en addProduct:", error);
            throw error;
        }
    }
    static async removeProduct(cartId, productId) {
        const cart = await cartsModels.findById(cartId);
        if (!cart) throw new Error("Carrito no encontrado");
    
        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    
        if (productIndex === -1) {
            throw new Error("Producto no encontrado en el carrito");
        }
    
        cart.products.splice(productIndex, 1);
        await cart.save();
        return await cart.populate("products.product");
    }
    
    
}



