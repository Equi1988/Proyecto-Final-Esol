import express from 'express';
import { conectarDB } from './connDB.js';
import { config } from './config/config.js';
import { router as productsRouter } from './routers/productsRouter.js';
import { router as vistasRouter } from './routers/viewsRouter.js';
import { router as cartsRouter } from './routers/cartsRouter.js'; // Importa el router de carts
// const socketIo = require("socket.io");
import { engine } from 'express-handlebars';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const io = socketIo(server);
const PORT = config.PORT;

const app = express();


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter); // Agrega las rutas de carritos
app.use("/", vistasRouter);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('Bienvenidos a EsolProducts');
});

// app.get('/api/carts/:cartId/products/:productId', (req, res) => {
//     res.send('Endpoint configurado correctamente');
// });


// Inicia el servidor
const server = app.listen(PORT, () => {
    console.log(`Server escuchando en puerto ${PORT}`);
});

// Conexión a la base de datos
conectarDB(
    config.MONGO_URL,
    config.DB_NAME
);

// // Socket.IO
// io.on("connection", async (socket) => {
//     console.log("Nuevo cliente conectado");

//     // Inicializar productos desde ProductsManager
//     let productos = await ProductsManager.getProducts(); // Obtén los productos actuales
//     socket.emit("initialProducts", productos);

//     // Evento para agregar producto
//     socket.on("newProduct", async (product) => {
//         const { title, description, price, code, stock, category } = product;

//         // Validaciones
//         if (!title || !description || !price || !code || !stock || !category) {
//             return socket.emit("errorMessage", "Todos los campos son obligatorios");
//         }
//         if (typeof title !== "string" || typeof description !== "string" || typeof code !== "string" || typeof category !== "string") {
//             return socket.emit("errorMessage", "title, description, code y category deben ser strings");
//         }
//         if (typeof price !== "number" || typeof stock !== "number") {
//             return socket.emit("errorMessage", "price y stock deben ser números");
//         }

//         // Verificar si el código existe
//         const codeExists = productos.some(p => p.code === code);
//         if (codeExists) {
//             return socket.emit("errorMessage", "El código ya existe en otro producto");
//         }

//         // Agregar el nuevo producto
//         const newProduct = { id: productos.length + 1, ...product };
//         await ProductsManager.addProduct(newProduct); // Guardar en el almacenamiento

//         // Obtener la lista actualizada de productos directamente desde el almacenamiento
//         productos = await ProductsManager.getProducts(); // Actualizar productos

//         // Emitir la lista actualizada al cliente
//         io.emit("initialProducts", productos);
//     });

//     // Evento para eliminar producto
//     socket.on("deleteProduct", async (id) => {
//         const exists = productos.some(p => p.id === parseInt(id));
//         if (!exists) {
//             return socket.emit("errorMessage", "Producto no encontrado para eliminar");
//         }
//         productos = productos.filter(p => p.id !== parseInt(id));
//         await ProductsManager.deleteProduct(id); // Eliminar del almacenamiento
//         productos = await ProductsManager.getProducts(); // Obtener lista actualizada

//         io.emit("initialProducts", productos); // Emitir lista actualizada
//     });

//     socket.on("disconnect", () => console.log("Cliente desconectado"));
// });