import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;

const ComentarioSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    articulo: {
        type: Schema.Types.ObjectId,
        ref: "Articulo"
    },
    comentario: {
        type: String,
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});


ComentarioSchema.plugin(mongoosePaginate);

const Comentario = model('Comentario', ComentarioSchema, 'comentarios');

export default Comentario;