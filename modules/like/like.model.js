import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;

const LikeSchema = Schema({
    user: { type: Schema.ObjectId, ref: "User" },
    liked: { type: Schema.ObjectId, ref: "publication" },
    create_at: { type: Date, default: Date.now }
});

LikeSchema.plugin(mongoosePaginate);

const Like = model('Like', LikeSchema, 'likes');

const NoLikeSchema = Schema({
    user: { type: Schema.ObjectId, ref: "User" },
    noliked: { type: Schema.ObjectId, ref: "publication" },
    create_at: { type: Date, default: Date.now }
});

NoLikeSchema.plugin(mongoosePaginate);

const NoLike = model('NoLike', NoLikeSchema, 'nolikes');

const ContadorLikesSchema = Schema({
    articuloId: { type: Schema.Types.ObjectId, ref: "Articulo", required: true },
    like: { type: Number, default: 0 },
    nolike: { type: Number, default: 0 }
});

ContadorLikesSchema.plugin(mongoosePaginate);

const ContadorLikes = model('ContadorLikes', ContadorLikesSchema, 'contadorLikes');

export { Like, NoLike, ContadorLikes };
export default Like;
