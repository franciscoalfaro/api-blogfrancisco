import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;


const ContadorArticulosSchema = Schema({
    articuloId: {
        type: Schema.Types.ObjectId,
        ref: "Articulo",
        required:true
    },
    visto:{
        type:Number,
        default: 0,
        required:true
    }
    
});


ContadorArticulosSchema.plugin(mongoosePaginate);

const ContadorArticulo = model('ContadorArticulo', ContadorArticulosSchema, 'contadorArticulo');

export default ContadorArticulo;