const fs = require("fs");
const ProductsManager = require("./productsManager");

class CartManager {
    static path = "./src/data/carts.json";

    // Crear un carrito nuevo
    static async createCart() {
        let carts = await this.getCarts();
        let cart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
        carts.push(cart);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return cart;
    }

    // Obtener todos los carritos
    static async getCarts() {
        if (fs.existsSync(this.path)) {
            const fileData = await fs.promises.readFile(this.path, "utf-8");
            return fileData.trim().length ? JSON.parse(fileData) : [];
        } else {
            return [];
        }
    }

    // Obtener un carrito por su ID
    static async getCartById(cartId) {
        const carts = await this.getCarts();
        return carts.find(cart => cart.id === parseInt(cartId));
    }

    // Agregar un producto a un carrito
    static async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        let cart = carts.find(cart => cart.id === parseInt(cartId));

        // Si no existe el carrito, crearlo
        if (!cart) {
            console.log(`Carrito ${cartId} no encontrado. Creando uno nuevo.`);
            cart = { id: parseInt(cartId), products: [] };
            carts.push(cart);
        }

        // Obtener el producto desde ProductsManager
        const product = await ProductsManager.getProductById(productId);
        if (!product) throw new Error("Producto no encontrado");
        if (product.stock <= 0) throw new Error("Producto sin stock disponible");

        // Reducir el stock del producto antes de agregarlo al carrito
        const updatedProduct = { ...product, stock: product.stock - 1 };
        await ProductsManager.updateProduct(productId, { stock: updatedProduct.stock });

        // Agregar o actualizar el producto en el carrito
        const cartProduct = cart.products.find(p => p.id === parseInt(productId));
        if (cartProduct) {
            cartProduct.quantity += 1;
        } else {
            cart.products.push({
                id: productId,
                title: product.title,
                price: product.price,
                quantity: 1,
            });
        }

        // Guardar cambios en los carritos
        await this.saveCarts(carts);
        console.log(`Producto ${productId} agregado al carrito ${cartId}`);
        return cart;
    }

    // Guardar los carritos en el archivo
    static async saveCarts(carts) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            console.log("Carritos guardados exitosamente.");
        } catch (error) {
            console.error("Error al guardar los carritos:", error);
            throw new Error("No se pudo guardar los carritos.");
        }
    }

    // Eliminar un carrito
    static async deleteCart(cartId) {
        const carts = await this.getCarts();
        const index = carts.findIndex(cart => cart.id === parseInt(cartId));
        if (index === -1) return false;
        carts.splice(index, 1);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return true;
    }
}

module.exports = CartManager;