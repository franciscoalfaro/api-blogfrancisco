import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;


const ArticuloSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    titulo: {
        type: String,
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    Autor: {
        type: String,
        required: true
    },
    ApellidoAutor: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "Categoria"
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    images: [{
        filename: String,
    }],
});


ArticuloSchema.plugin(mongoosePaginate);

const Articulo = model('Articulo', ArticuloSchema, 'articulos');

export default Articulo;