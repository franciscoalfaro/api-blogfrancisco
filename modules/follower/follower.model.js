import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;

const SeguidorSchema = Schema({
    userId: { type: Schema.ObjectId, ref: "User" },
    creadorId: { type: Schema.ObjectId, ref: "User" },
    create_at: { type: Date, default: Date.now }
});

SeguidorSchema.plugin(mongoosePaginate);

const Seguidor = model('Seguidor', SeguidorSchema, 'seguidores');

export default Seguidor;
