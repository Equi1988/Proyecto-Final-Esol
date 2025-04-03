# Proyecto Final Esol

## Programación Backend I: Desarrollo Avanzado de Backend

Este proyecto es una API y sistema de gestión de productos y carritos de compra desarrollado con Node.js, Express, MongoDB, Handlebars y Socket.IO.

---

## 📌 Tecnologías utilizadas

- **Node.js** con Express para el servidor.
- **MongoDB** con Mongoose para la base de datos.
- **Handlebars** para renderizar vistas dinámicas.
- **Socket.IO** para actualizaciones en tiempo real.

---

## 📂 Instalación y ejecución

1. Clona el repositorio:

   ```sh
   git clone https://github.com/Equi1988/Proyecto-Final-Esol.git
   cd Proyecto-Final-Esol
   ```

2. Instala las dependencias:

   ```sh
   npm install
   ```

3. Configura las variables de entorno (ejemplo en `.env.example`).

4. Inicia el servidor:

   ```sh
   npm start
   ```

El servidor se ejecutará en `http://localhost:8080`.

---

## 🔗 Rutas de la API

### 📦 Productos

#### Obtener todos los productos con paginación, filtros y ordenamiento
- **GET** `/api/products`
- Parámetros opcionales:
  - `limit`: Número de productos por página.
  - `page`: Número de página.
  - `sort`: Ordenar por precio (`asc` o `desc`).
  - `query`: Filtrar por categoría u otra propiedad.
- **Ejemplo:**
  ```sh
  GET http://localhost:8080/api/products?limit=10&page=1&sort=asc&query=ropa
  ```

#### Obtener un producto por ID
- **GET** `/api/products/:pid`

#### Crear un producto
- **POST** `/api/products`
- **Body (JSON)**:
  ```json
  {
    "title": "Camiseta",
    "description": "Camiseta de algodón",
    "price": 20,
    "category": "ropa",
    "stock": 100
  }
  ```

#### Actualizar un producto
- **PUT** `/api/products/:pid`
- **Body (JSON)**: Mismo formato que `POST`.

#### Eliminar un producto
- **DELETE** `/api/products/:pid`

---

### 🛒 Carritos

#### Obtener un carrito por ID (con productos populados)
- **GET** `/api/carts/:cid`

#### Crear un carrito vacío
- **POST** `/api/carts`

#### Agregar un producto al carrito
- **POST** `/api/carts/:cid/products/:pid`

#### Actualizar la cantidad de un producto en el carrito
- **PUT** `/api/carts/:cid/products/:pid`
- **Body (JSON)**:
  ```json
  {
    "quantity": 3
  }
  ```

#### Eliminar un producto del carrito
- **DELETE** `/api/carts/:cid/products/:pid`

#### Vaciar un carrito
- **DELETE** `/api/carts/:cid`

---

## 🎨 Vistas disponibles

### Productos
- **URL:** `http://localhost:8080/products`
- Permite ver todos los productos con paginación y botones de compra.

### Detalle de un producto
- **URL:** `http://localhost:8080/products/:pid`
- Muestra información detallada de un producto y permite agregarlo al carrito.

### Carrito
- **URL:** `http://localhost:8080/carts/:cid`
- Lista los productos añadidos a un carrito específico.

---

## 📩 Uso en Postman

Para probar la API en **Postman**, sigue estos pasos:

1. **Abre Postman** y crea una nueva solicitud.
2. **Configura la URL** con `http://localhost:8080/api/` y la ruta correspondiente.
3. **Si es un POST o PUT**, en la pestaña **Body**, selecciona `raw` y elige el formato `JSON`, luego ingresa los datos.
4. **Envía la solicitud** y revisa la respuesta.

También puedes importar una colección de Postman con todas las rutas. 🚀

---

## 🛠 Mantenimiento y mejoras

- Implementación de autenticación y autorización.
- Mejoras en la interfaz de usuario.
- Integración con pasarelas de pago.

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT. ¡Siéntete libre de contribuir! 💻✨

 