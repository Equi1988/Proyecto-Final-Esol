const fs = require("fs").promises;
const path = require("path");

const productsPath = path.join(__dirname, "../data/products.json");

class ProductsManager {
    // Obtener todos los productos
    static async getProducts() {
        const data = await fs.readFile(productsPath, "utf-8");
        return JSON.parse(data);
    }

    // Obtener un producto por su ID
    static async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === parseInt(id));
    }

    // Agregar un nuevo producto
    static async addProduct(product) {
        const products = await this.getProducts();
        const newProduct = { id: products.length + 1, ...product };
        products.push(newProduct);
        await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
        return newProduct;
    }

    // Actualizar un producto existente
    static async updateProduct(id, updatedFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index === -1) throw new Error("Product not found");
    
        // Actualiza solo los campos proporcionados
        const product = products[index];
        for (let key in updatedFields) {
            if (updatedFields.hasOwnProperty(key) && product.hasOwnProperty(key)) {
                product[key] = updatedFields[key];
            }
        }
    
        // Guarda el producto actualizado en el archivo
        await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
        return product;
    }
    

    // Eliminar un producto
    static async deleteProduct(id) {
        let products = await this.getProducts();
        products = products.filter(p => p.id !== parseInt(id));
        await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
    }
}

module.exports = ProductsManager;
