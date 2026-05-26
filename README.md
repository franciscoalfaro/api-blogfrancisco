# API Blog Francisco

![Node.js](https://img.shields.io/badge/Node.js-23.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-9.x-brightgreen?logo=mongodb)
![AWS](https://img.shields.io/badge/Deployed-AWS-orange?logo=amazon-aws)
![License](https://img.shields.io/badge/License-MIT-blue)

API RESTful para el blog personal de Francisco Alfaro. Construida con Express 5, MongoDB, JWT y un conjunto completo de medidas de seguridad.

## Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 23.x | Runtime |
| Express | 5.2.x | Framework HTTP |
| MongoDB | - | Base de datos NoSQL |
| Mongoose | 9.x | ODM |
| JWT (jsonwebtoken) | 9.x | Autenticación |
| bcrypt | 6.x | Hashing de contraseñas |
| Helmet | 8.x | Headers de seguridad HTTP |
| express-rate-limit | 8.x | Limitación de tasa |
| Multer + Sharp | - | Subida y procesamiento de imágenes |
| Nodemailer | 8.x | Envío de correos |
| sanitize-html | 2.x | Sanitización de contenido HTML |
| validator | 13.x | Validación de campos |

## Arquitectura

El proyecto sigue una arquitectura modular basada en características (feature-based modules):

```
api-blogfrancisco/
├── api-blogfrancisco.js     # Entry point
├── app.js                   # Configuración Express (middleware global, rutas)
├── config/
│   ├── env.js               # Validación de variables de entorno
│   └── db.js                # Conexión MongoDB
├── middleware/
│   ├── auth.js              # Middleware JWT
│   └── upload.js            # Procesamiento de imágenes (Multer + Sharp)
├── shared/
│   ├── errors/              # AppError, errorHandler, asyncHandler
│   ├── jwt/                 # Creación de tokens (auth + reset)
│   ├── email/               # Envío de correos (recuperación, contacto, informativo)
│   ├── sanitize/            # Sanitización de HTML
│   └── utils/               # Utilidades (asyncHandler)
├── modules/
│   ├── auth/                # Registro e inicio de sesión
│   ├── user/                # Perfil, avatar, listado de usuarios
│   ├── article/             # CRUD de artículos, imágenes, búsqueda
│   ├── category/            # CRUD de categorías
│   ├── comment/             # Comentarios en artículos
│   ├── like/                # Likes / No likes
│   ├── follower/            # Seguidores
│   ├── social/              # Redes sociales
│   ├── contact/             # Formulario de contacto
│   └── recovery/            # Recuperación de contraseña
├── uploads/
│   ├── publications/        # Imágenes de artículos
│   ├── avatars/             # Avatares de usuarios
│   └── html/                # Plantillas de correo HTML
└── .env                     # Variables de entorno
```

### Flujo de petición

```
Cliente → Cloudflare (SSL, caché) → Nginx (reverse proxy, rewrites) → Express (API) → MongoDB
```

## Instalación

### Prerrequisitos

- Node.js 23+
- MongoDB (local o remoto)
- Cuenta SMTP para envío de correos (Zoho recomendado)

### Instalación

```bash
git clone <repo>
cd api-blogfrancisco
pnpm install   # o npm install
```

### Variables de entorno (`.env`)

```env
PORT=3006
MONGODB_URI=mongodb+srv://<user>:<password>@<host>/blog?retryWrites=true&w=majority
SECRET_KEY=<cryptographically_strong_secret_64_chars_hex>
EMAIL_USER=<email_smtp>
EMAIL_PASSWORD=<password_smtp>
FRONTEND_URL=https://blog.franciscoalfaro.cl
NODE_ENV=production
```

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `PORT` | No | Puerto del servidor (default 3006) |
| `MONGODB_URI` | Sí | URI de conexión MongoDB |
| `SECRET_KEY` | Sí | Clave secreta para JWT (64 caracteres hex) |
| `EMAIL_USER` | Sí | Correo SMTP para envíos |
| `EMAIL_PASSWORD` | Sí | Contraseña SMTP |
| `FRONTEND_URL` | Sí | URL del frontend para enlaces de recuperación |
| `NODE_ENV` | No | `production` oculta detalles de error |

### Ejecución

```bash
npm start   # Inicia con nodemon (desarrollo)
node api-blogfrancisco.js   # Producción
```

## Endpoints

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/user/register` | No | Registrar nuevo usuario |
| POST | `/api/user/login` | No | Iniciar sesión |

### User

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/user/profile/:id` | Sí | Obtener perfil propio |
| GET | `/api/user/list{/:page}` | Sí | Listar usuarios (paginado) |
| PUT | `/api/user/update` | Sí | Actualizar perfil (requiere currentPassword si cambia password) |
| POST | `/api/user/upload` | Sí | Subir avatar |
| GET | `/api/user/avatar/:file` | No | Servir imagen de avatar |
| DELETE | `/api/user/delete/:id` | Sí | Eliminar usuario (soft delete) |
| GET | `/api/user/lastprofiles{/:page}` | No | Últimos perfiles públicos |
| GET | `/api/user/profilepublic/:id` | No | Perfil público de usuario |

### Article

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/articulo/create` | Sí | Crear artículo |
| DELETE | `/api/articulo/delete/:id` | Sí | Eliminar artículo |
| PUT | `/api/articulo/update/:id` | Sí | Actualizar artículo (solo campos permitidos) |
| POST | `/api/articulo/upload/:id` | Sí | Subir imagen de portada |
| POST | `/api/articulo/upload-content-image` | Sí | Subir imagen en contenido |
| GET | `/api/articulo/media/:file` | No | Servir imagen de artículo |
| DELETE | `/api/articulo/deleteimagen/:id` | Sí | Eliminar imagen de artículo |
| GET | `/api/articulo/search/:articulo{/:page}` | No | Buscar artículos |
| GET | `/api/articulo/obtenido/:id` | No | Obtener artículo por ID |
| GET | `/api/articulo/list{/:page}` | No | Listar artículos (paginado) |
| GET | `/api/articulo/ultimos/` | No | Últimos artículos más vistos |
| GET | `/api/articulo/misarticulos{/:page}` | Sí | Listar artículos del usuario autenticado |
| GET | `/api/articulo/articulouser/:id{/:page}` | No | Listar artículos de un usuario |
| POST | `/api/articulo/aumentar/:id` | No | Incrementar contador de vistas |

### Category

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/categoria/crearcategoria` | Sí | Crear categoría |
| PUT | `/api/categoria/update/:id` | Sí | Actualizar categoría (solo propia) |
| DELETE | `/api/categoria/delete/:id` | Sí | Eliminar categoría (solo propia) |
| GET | `/api/categoria/list{/:page}` | Sí | Listar categorías (paginado) |
| GET | `/api/categoria/listcategoria/` | Sí | Listar categorías (dropdown) |

### Comment

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/comentario/savecomment/:id` | Sí | Comentar artículo |
| DELETE | `/api/comentario/deletecomment/:id` | Sí | Eliminar comentario propio |
| GET | `/api/comentario/comment/:id{/:page}` | No | Listar comentarios de un artículo |

### Like

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/like/megusta/:id` | Sí | Dar like a artículo |
| POST | `/api/like/nolike/:id` | Sí | Dar no like a artículo |
| DELETE | `/api/like/unlike/:id` | Sí | Eliminar like/no like |
| GET | `/api/like/listlikes/:id` | No | Contador de likes de un artículo |

### Follower

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/follow/seguir/:id` | Sí | Seguir usuario |
| DELETE | `/api/follow/dejarseguir/:id` | Sí | Dejar de seguir |
| GET | `/api/follow/miseguidores/` | Sí | Mis seguidores |
| GET | `/api/follow/seguidores/:id` | No | Seguidores de un usuario |
| GET | `/api/follow/quiensigue/:id` | No | A quién sigue un usuario |

### Social

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/redes/create` | Sí | Crear red social |
| PUT | `/api/redes/update/:id` | Sí | Actualizar red social |
| DELETE | `/api/redes/delete/:id` | Sí | Eliminar red social |
| GET | `/api/redes/list{/:page}` | Sí | Listar redes del usuario |
| GET | `/api/redes/listado/:id{/:page}` | No | Redes públicas de un usuario |
| GET | `/api/redes/redesadministrador` | No | Redes del administrador |

### Contact

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/contacto/crear` | No | Enviar formulario de contacto |

### Recovery

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/recovery/request-reset` | No | Solicitar recuperación de contraseña |
| POST | `/api/recovery/reset-password/:token` | No | Restablecer contraseña (token en URL) |

## Modelos de datos

### User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | String (req) | Nombre |
| `surname` | String | Apellido |
| `nick` | String (req) | Nickname único |
| `email` | String (req) | Correo electrónico |
| `password` | String (req) | Hash bcrypt (12 rondas) |
| `role` | String | `role_user` por defecto |
| `image` | String | Nombre del avatar |
| `bio` | String | Biografía |
| `title` | String | Título profesional |
| `frasefavorita` | String | Frase favorita |
| `eliminado` | Boolean | Soft delete |

### Article

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | ObjectId (ref User) | Autor |
| `titulo` | String (req) | Título |
| `contenido` | String (req) | Contenido HTML |
| `descripcion` | String (req) | Descripción corta |
| `Autor` | String | Nombre del autor |
| `categoria` | ObjectId (ref Categoria) | Categoría |
| `coverImage` | String | Imagen de portada |
| `imagenes` | Array | URLs de imágenes incrustadas |

### Category
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | ObjectId (ref User) | Propietario |
| `name` | String (req) | Nombre de categoría |

### Redes (Social)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | ObjectId (ref User) | Propietario |
| `name` | String (req) | Nombre de la red |
| `url` | String (req) | URL validada |

## Seguridad — Políticas aplicadas

### 1. Headers HTTP (Helmet + CSP)

Se utiliza Helmet con una política de seguridad de contenido (CSP) estricta:

```js
Content-Security-Policy:
  default-src 'self';
  img-src 'self' data: https://apiv2.franciscoalfaro.cl https://blog.franciscoalfaro.cl;
  style-src 'self' https: 'unsafe-inline';
  font-src 'self' https: data:;
  script-src 'self';
```

| Header | Valor | Efecto |
|--------|-------|--------|
| `X-Content-Type-Options` | `nosniff` | Evita MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Evita clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forza HTTPS |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Permite recursos cross-origin |

### 2. CORS

Acceso restringido exclusivamente a los dominios del frontend:

```js
origin: [
  'https://blog.franciscoalfaro.cl',
  'https://www.blog.franciscoalfaro.cl'
]
```

### 3. Rate Limiting

| Límite | Ventana | Máximo | Rutas afectadas |
|--------|---------|--------|-----------------|
| Auth limiter | 15 min | 5 | `/api/user/login`, `/api/recovery/request-reset` |
| API limiter | 15 min | 100 | Todas las rutas `/api/*` |

### 4. Autenticación JWT

- Tokens generados con `jsonwebtoken` (antes `jwt-simple`)
- Token de autenticación: expira en **30 días**
- Token de recuperación: expira en **1 hora**
- Verificación en middleware con manejo específico de `TokenExpiredError`
- Mensaje genérico en login (`"Credenciales inválidas"`) — previene enumeración de usuarios

### 5. Política de contraseñas

- Mínimo **8 caracteres**
- Al menos **1 mayúscula**
- Al menos **1 minúscula**
- Al menos **1 dígito**
- Hash con **bcrypt (12 rondas)**
- Para cambiar contraseña: se requiere `currentPassword` (confirmación de identidad)
- Mensajes de error genéricos en login

### 6. Validación de entrada

Se utiliza el paquete `validator` para validar todos los campos de entrada en:
- Registro e inicio de sesión
- Creación y actualización de artículos
- Actualización de perfil de usuario
- Formulario de contacto

### 7. Sanitización de contenido HTML

El contenido de los artículos se sanitiza con `sanitize-html`:

```js
allowedTags: ['b','i','em','strong','a','p','h1'...'span']
allowedSchemes: ['http', 'https']   // Sin 'data:' ni 'javascript:'
```

Los comentarios se sanitizan eliminando **todas las etiquetas HTML** (solo texto plano).

### 8. Protección contra Mass Assignment

| Módulo | Campos permitidos |
|--------|-------------------|
| `user.updateUser` | name, surname, nick, email, title, bio, frasefavorita, newPassword |
| `article.actualizarArticulo` | titulo, contenido, descripcion, categoria |

Cualquier campo adicional enviado en la petición es ignorado.

### 9. Prevención de IDOR (Insecure Direct Object Reference)

Todos los queries sensibles verifican pertenencia al usuario autenticado:

- **Categorías**: `findOneAndUpdate({ _id: id, userId })`
- **Redes sociales**: `findOneAndDelete({ _id: id, userId })`
- **Comentarios**: `findOneAndDelete({ _id: commentsId, userId })`

### 10. Protección contra Path Traversal

Los endpoints que sirven archivos (`media`, `avatar`) rechazan nombres que contengan `..` o `/`:

```js
if (file.includes('..') || file.includes('/')) {
  return res.status(400).json({ message: "Nombre de archivo inválido" });
}
```

### 11. Seguridad en subida de imágenes

| Medida | Implementación |
|--------|----------------|
| Validación de extensión | Solo png, jpg, jpeg, gif |
| Validación de MIME type | image/jpeg, image/png, image/gif, image/webp |
| Límite de tamaño | 5 MB |
| Redimensionado | Máximo 1920x1080px (manteniendo proporción) |
| Conversión | Todas las imágenes se convierten a WebP calidad 80 |
| Nombre de archivo seguro | Se reemplazan caracteres peligrosos: `replace(/[^a-zA-Z0-9._-]/g, '')` |
| Ruta de subida | Separada: `uploads/publications/` y `uploads/avatars/` |

### 12. Manejo seguro de errores

- En **producción** (`NODE_ENV=production`): los errores internos devuelven solo `"Error interno del servidor"`, sin detalles técnicos
- En **desarrollo**: se incluye `error.message` para depuración
- Errores operacionales controlados (AppError) muestran su mensaje específico

### 13. Rate Limiting por ruta sensible

Las rutas de autenticación y recuperación tienen un límite más restrictivo (5 intentos cada 15 minutos) para prevenir ataques de fuerza bruta.

### 14. Validación de entorno al inicio

```js
const requiredVars = ['SECRET_KEY', 'MONGODB_URI'];
// Si faltan, el servidor NO inicia
```

### 15. Trust Proxy

```js
app.set('trust proxy', 1);
```

Configuración necesaria para que Express confíe en el header `X-Forwarded-For` enviado por Nginx/Cloudflare. Requisito para que `express-rate-limit` identifique correctamente la IP real del cliente detrás del proxy inverso.

## Formato de respuestas

### Éxito
```json
{
  "status": "success",
  "message": "Descripción de la operación",
  "...": "datos específicos del endpoint"
}
```

### Error
```json
{
  "status": "error",
  "message": "Descripción genérica del error"
}
```

### Advertencia
```json
{
  "status": "warning",
  "message": "Descripción de la advertencia"
}
```

### Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Error de validación o datos inválidos |
| 401 | Token expirado |
| 403 | Autenticación requerida |
| 404 | Recurso no encontrado |
| 409 | Conflicto (recurso duplicado) |
| 500 | Error interno del servidor |

## Deployment

### Nginx (reverse proxy)

```nginx
location ^~ /api-blogfrancisco/ {
    rewrite ^/api-blogfrancisco/(.*)$ /$1 break;
    proxy_pass http://127.0.0.1:3006/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
