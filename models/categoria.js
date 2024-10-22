import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;


const CategoriaSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});


CategoriaSchema.plugin(mongoosePaginate);

const Categoria = model('Categoria', CategoriaSchema, 'categorias');

export default Categoria;
