const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require('mongoose');

const n = crypto.randomInt(0, 1000000);
var milliseconds = new Date().getTime().toString(); 
const randomID = n+milliseconds
function  generatePIN (length) {
  return Math.floor(Math.pow(10, length-1)+ Math.random() * (Math.pow(10, length) - randomID.substring(randomID.length-4) - 1));
}
module.exports.login = async (req, res, next) => {
  try {
    const { username, password, device } = req.body;
    const user = await User.findOne({ username });
    if (!user){
      return res.json({ msg: "Incorrect Username or Password", status: false });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
      return res.json({ msg: "Incorrect Username or Password", status: false });
    }
    if(user.devices.length > 0){
      user.devices.forEach(function(obj){
        if( obj.device.browser === device.browser && obj.device.version === device.version && obj.device.os === device.os){
          delete user.password;
          return res.json({ status: true, user });
        }else{
          return res.json({ msg: "Your Account already Exist from another Browser "+obj.device.browser+" versi : "+obj.device.version+" os : "+obj.device.os, status: false });
        }
      })
    }
    else{
      delete user.password;
      return res.json({ status: true, user });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password, gender } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    avatarImage = null
    if (gender === "male"){
      avatarImage ="https://is3.cloudhost.id/chatimage2022/image_chat/1669781522131-male_avatar.jpg"
    }else{
      avatarImage="https://is3.cloudhost.id/chatimage2022/image_chat/1669781543257-femal_avatar.jpg"
    }
    const user = await User.create({
      pin:generatePIN(6),
      email,
      username,
      password: hashedPassword,
      isAvatarImageSet: true,
      gender:gender,
      avatarImage: avatarImage,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllFriends = async (req, res, next) => {
  try {
    const getFriend = await User.findOne({ _id: req.params.id });
    let myArray = []
    if(getFriend.friends.length > 0){
      getFriend.friends.forEach(function(obj){
        myArray.push(obj._id);
      })
      const users = await User.find({ _id: { $in: myArray } }).select([
        "email",
        "username",
        "connected",
        "logout",
        "avatarImage",
        "_id",
        "pin"
      ]).sort({ username: 1 });
      return res.json(users);
    }else{
      return res.json(null);
    }
   
  } catch (ex) {
    next(ex);
  }
};

module.exports.getFriendsMandatory= async (req, res, next) => {
  try {
    const getFriend = await User.findOne({ _id: req.params.id });
    return res.json(getFriend.friends);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "connected",
      "logout",
      "avatarImage",
      "_id",
      "pin"
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    let arrayDevices = []
    const user = User.findOne({ _id:req.params.id });
    if(user.devices.length > 0){
      user.devices.forEach(function(obj){
      arrayDevices.push(obj._id);
      User.findByIdAndUpdate({ _id:req.params.id }, {
        $pull: {
            devices: { _id: obj._id }
        }
      }, { new: true });
      })
    }
    var update = {
      connected:false
    }
      User.findOneAndUpdate(
        req.params.id,
        update, 
        {new: true});
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.updateConnected = (req, res, next) => {
  try {
    User.findByIdAndUpdate(req.params.id, 
      {connected:req.body.status_connect}, function(err, data) {
          if(err){
            res.status(400).send(err);
          }
          else{
            return res.status(200).send(data);
          }
  }); 
  } catch (ex) {
    next(ex);
  }
};

module.exports.addFriends = async (req, res, next) => {
  try {
    const { username,type } = req.body;
    const userId = req.params.id;

    const usernameCheck = await User.findOne({$or: [
      {username: username},
      {pin: username}
      ]});
    if (!usernameCheck)return res.json({ msg: "Pin atau Username tidak ditemukan ",success:false });
    console.log(userId)
    var update = {
      $addToSet: { friends: { _id: usernameCheck._id, chatUpdatedAt:new Date(),type: 'private', block:false } }
    }
    const userData = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    );
    return res.json({ msg:"Teman berhasil di Add",status: true, userData });
  } catch (ex) {
    next(ex);
  }
};

module.exports.addDevices = async (req, res, next) => {
  try {
    const {device} = req.body;
    const userId = req.params.id;

    var update = {
      $addToSet: { devices: { _id: new mongoose.Types.ObjectId(), device:device } }
    }
    const updateDevice = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    );
    const user = await User.findOne({ userId });
    return res.json({ msg:"Device berhasil di Add",status: true, user });
  } catch (ex) {
    next(ex);
  }
};
