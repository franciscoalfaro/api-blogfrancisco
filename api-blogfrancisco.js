//importar dependencia de conexion
import {connection} from './database/connection.js'
import express from "express"
import cors from  "cors"


// efectuar conexion a BD
connection();

//crear conexion a servidor de node
const app = express();
const puerto = 3006;

//configurar cors
app.use(cors({
    exposedHeaders: ['Content-Disposition']
  }));


// Convertir los datos del body a objeto JS con límites ajustados
app.use(express.json({ limit: '10mb' })); // Ajusta el límite a 10 MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Ajusta el límite a 10 MB



//cargar rutas
import UserRoutes from "./routes/user.js";
import RecoveryRoutes from "./routes/recovery.js";
import ArticuloRoutes from "./routes/articulo.js";
import ComentarioRoutes from "./routes/comentario.js";
import CategoriaRoutes from "./routes/categoria.js";
import RedesRoutes from "./routes/redes.js";
import LikeRoutes from "./routes/like.js";
import SeguidorRoutes from "./routes/seguidor.js";
import ContactoRoutes from "./routes/contacto.js";



// llamado a la ruta user
app.use("/api/user", UserRoutes);

//recovery
app.use("/api/recovery", RecoveryRoutes)

//directorios
app.use("/api/articulo",ArticuloRoutes)

//archivos
app.use("/api/comentario",ComentarioRoutes)

//espacio
app.use("/api/categoria",CategoriaRoutes)

//redes
app.use("/api/redes",RedesRoutes)

//like
app.use("/api/like",LikeRoutes)

//seguidores
app.use("/api/follow",SeguidorRoutes)


//contacto
app.use("/api/contacto",ContactoRoutes)

app.listen(puerto, ()=> {
    console.log("Server runing in port :" +puerto)
})