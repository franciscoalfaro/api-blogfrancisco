import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;


const LikeSchema = Schema ({
    user:{
        type:Schema.ObjectId,
        ref:"User"
    },
    liked:{
        type:Schema.ObjectId,
        ref:"publication"
    },
    create_at:{
        type:Date,
        default:Date.now
    }

})



LikeSchema.plugin(mongoosePaginate);

const NoLike = model('Like', LikeSchema, 'likes');

export default NoLike;