const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  friends: Array,
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  connected: {
    type: Boolean,
    default: false,
  },
  logout:{
    type:Boolean,
    default:false
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  gender:{
    type:String,
    default:'male'
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  pin: {
    type: String,
    default: "",
    unique:true
  },
});

module.exports = mongoose.model("Users", userSchema);
