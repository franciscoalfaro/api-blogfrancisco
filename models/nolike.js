import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;

const NoLikeSchema = Schema ({
    user:{
        type:Schema.ObjectId,
        ref:"User"
    },
    noliked:{
        type:Schema.ObjectId,
        ref:"publication"
    },
    create_at:{
        type:Date,
        default:Date.now
    }

})


NoLikeSchema.plugin(mongoosePaginate);

const NoLike = model('NoLike', NoLikeSchema, 'nolikes');

export default NoLike;