import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;

const RedesSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

RedesSchema.plugin(mongoosePaginate);

const Redes = model('Redes', RedesSchema, 'redes');
export default Redes;