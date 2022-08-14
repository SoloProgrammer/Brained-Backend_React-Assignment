const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    avatar:{
        type:String,
        default:""
    },
    fname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    profession:{
        type:String,
        default:""
    },
    about:{
        type:String,
        default:""
    },

},{
    timestamps: true
})

module.exports = mongoose.model("users",UserSchema)