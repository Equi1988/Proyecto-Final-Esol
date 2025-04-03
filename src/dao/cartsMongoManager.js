import mongoose from "mongoose";
import { cartsModels } from "./models/cartsModels.js";

export class cartsMongoManager {
    static async get() {
        return await cartsModels.find().lean();
    }

    static async getBy(filtro = {}) {
        return await cartsModels.findOne(filtro).lean();
    }

    static async save(cart) {
        const formattedCart = {
            products: cart.productos.map(p => ({
                product: new mongoose.Types.ObjectId(p.product),
                quantity: p.quantity
            }))
        };
        return await cartsModels.create(formattedCart);
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

}
