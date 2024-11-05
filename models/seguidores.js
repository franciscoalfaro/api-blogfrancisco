import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;


const Seguidorchema = Schema ({
    userId:{
        type:Schema.ObjectId,
        ref:"User"
    },
    creadorId:{
        type:Schema.ObjectId,
        ref:"User"
    },
    create_at:{
        type:Date,
        default:Date.now
    }

})



Seguidorchema.plugin(mongoosePaginate);

const Seguidor = model('Seguidor', Seguidorchema, 'seguidores');

export default Seguidor;