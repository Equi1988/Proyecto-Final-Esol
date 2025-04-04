import express from 'express';
import { conectarDB } from './connDB.js';
import { config } from './config/config.js';
import { router as productsRouter } from './routers/productsRouter.js';
import { router as vistasRouter } from './routers/viewsRouter.js';
import { router as cartsRouter } from './routers/cartsRouter.js'; // Importa el router de carts
import { productsModels } from './dao/models/productsModels.js';
import { engine } from 'express-handlebars';
import { Server } from "socket.io";
import http from "http";


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const io = socketIo(server);
const PORT = config.PORT;

const app = express();


const server = http.createServer(app);

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


// Inicia el servidor
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

// Conexión a la base de datos
conectarDB(
    config.MONGO_URL,
    config.DB_NAME
);

const io = new Server(server);

// Manejo de conexiones con Socket.IO
io.on("connection", async (socket) => {
    console.log("🟢 Usuario conectado con Socket.IO");

    // Enviar productos al conectar
    const products = await productsModels.find().lean();
    socket.emit("updateProducts", products);

    // Agregar un nuevo producto
    socket.on("addProduct", async (newProduct) => {
        try {
            const createdProduct = await productsModels.create(newProduct);
            const updatedProducts = await productsModels.find().lean();
            io.emit("updateProducts", updatedProducts);
        } catch (error) {
            console.error("❌ Error al agregar producto:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 Usuario desconectado");
    });
});