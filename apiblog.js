//importar dependencia de conexion
import {connection} from './database/connection.js'
import express from "express"
import cors from  "cors"


// efectuar conexion a BD
connection();

//crear conexion a servidor de node
const app = express();
const puerto = 3007;

//configurar cors
app.use(cors({
    exposedHeaders: ['Content-Disposition']
  }));

//conertir los datos del body a obj js
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//cargar rutas
import UserRoutes from "./routes/user.js";
import RecoveryRoutes from "./routes/recovery.js";
import ArticuloRoutes from "./routes/articulo.js";
import ComentarioRoutes from "./routes/comentario.js";
import CategoriaRoutes from "./routes/categoria.js";
import RedesRoutes from "./routes/redes.js";
import LikeRoutes from "./routes/like.js";
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

//contacto
app.use("/api/contacto",ContactoRoutes)

app.listen(puerto, ()=> {
    console.log("Server runing in port :" +puerto)
})