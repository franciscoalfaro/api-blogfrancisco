import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;


const ContadorLikesSchema = Schema({
    articuloId: {
        type: Schema.Types.ObjectId,
        ref: "Articulo",
        required:true
    },
    like:{
        type:Number,
        default: 0,
    },
    nolike:{
        type:Number,
        default: 0,
    },
    
});


ContadorLikesSchema.plugin(mongoosePaginate);

const ContadorLikes = model('ContadorLikes', ContadorLikesSchema, 'contadorLikes');

export default ContadorLikes;