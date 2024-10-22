import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const { Schema, model } = mongoose;

const UserSchema = Schema({
    name:{
        type:String,
        require:true
    },
    surname:{
        type:String
    },
    bio:{
        type:String
    },
    title:{
        type:String
    },
    frasefavorita:{
        type:String
    },
    nick:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        default:"role_user"
    },
    image:{
        type:String,
        default:"default.png"
    },
    eliminado:{
        type: Boolean,
        default: false
    },
    organizacion: {
        type: String,
        default: "franciscoalfaro.cl"
    },
    create_at:{
        type:Date,
        default:Date.now

    }

})

UserSchema.plugin(mongoosePaginate);

const User = model('User', UserSchema, 'users');

export default User;