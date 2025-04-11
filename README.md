---

# 📂 Sistema de Restaurant - Backend🍽️

Este es el servidor backend del sistema de gestión de pedidos para restaurantes. Maneja la lógica de negocio, autenticación y comunicación en tiempo real.

## 🚀 Tecnologías usadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Express Validator](https://express-validator.github.io/)
- [MySQL2](https://www.npmjs.com/package/mysql2)
- [Socket.IO](https://socket.io/)
- [Cloudinary](https://cloudinary.com/)
- [Multer](https://github.com/expressjs/multer)
- [JSON Web Tokens (JWT)](https://jwt.io/)

## 🛠️ Funcionalidades principales

- API RESTful para gestión de usuarios, órdenes, productos mesas y demás.
- Autenticación y autorización basada en JWT.
- Validación de datos con Express Validator.
- Subida de imágenes a Cloudinary usando Multer.
- Comunicación en tiempo real con Socket.IO (actualización de órdenes).
- Conexión a base de datos MySQL2.

## 📦 Instalación

1. Clonar el repositorio:
  ```bash
   git clone https://github.com/tu_usuario/tu_repositorio_backend.git
  ```

2. Installar dependencias
  ```bash
    npm install
  ```
3. Configuración variabels de entorno (.env)
```bash
  PORT=tu_port
  DB_HOST=tu_local
  DB_USER=tu_usuario_mysql
  DB_PASSWORD=tu_password_mysql
  DB_NAME=nombre_base_de_datos
  JWT_SECRET=tu_secreto
  CLOUDINARY_CLOUD_NAME=nombre_cloudinary
  CLOUDINARY_API_KEY=api_key_de_cloudinary
  CLOUDINARY_API_SECRET=api_secret_cloudinary
  FRONTEND_URL=tu_url_frontend
```
4. Iniciar el Servidor
   ```bash
   npm install
   ```

## WebSocket eventos Principales
- Nuevas Ordenes Enviadas a cocina.
- Actualización de estados de productos
- Notificación en tiempo real.
