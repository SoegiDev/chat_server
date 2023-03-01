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

module.exports.getDevices = async(req, res, next)=>{
  try {
    const user = await User.findOne({ _id:req.params.id });
    if(user.devices.length > 0){
      user.devices.forEach(function(obj){
          return res.json({ status: true,device:user.devices });
        })
    }else{
      return res.json({ msg: "Not Detection Device", status: false });
    }
  } catch (ex) {
    next(ex);
  }
};
module.exports.login = async (req, res, next) => {
  try {
    const { username, password, device } = req.body;
    const user = await User.findOne({ username:username });
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
          return res.json({ status: true,user:user });
        }else{
          return res.json({user:user, msg: "Your Account already Exist from another Browser "+obj.device.browser+" versi : "+obj.device.version+" os : "+obj.device.os, status: false,device:obj });
        }
      })
    }
    else{
      var update = {
        $addToSet: { devices: { _id: new mongoose.Types.ObjectId(), device:device } }
      }
      const updateDevice = await User.findByIdAndUpdate(
        {_id:user._id},
        update,
        { new: true }
      );
      delete user.password;
      const updateUser = await User.findOne({ username:username });
      return res.json({ status: true, user:updateUser });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password, gender } = req.body;
    const usernameCheck = await User.findOne({ username:username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email:email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    avatarImage = null
    if (gender === "male"){
      avatarImage ="https://zx16.sgp1.digitaloceanspaces.com/chatimage2022/male_avatar.jpg"
    }else{
      avatarImage="https://zx16.sgp1.digitaloceanspaces.com/chatimage2022/female_avatar.jpg"
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
      {_id:userId},
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

module.exports.logOut = async (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    const userId = req.params.id;

    const deleted = await User.findByIdAndUpdate ( 
      { "_id" : req.params.id} , 
      { "$pull" : { devices :  {_id: mongoose.Types.ObjectId(req.params.device) } }},
      { new: true }
    )
    console.log(deleted)
    return res.status(200).send({"device":deleted});
  } catch (ex) {
    next(ex);
  }
};

module.exports.updateConnected = (req, res, next) => {
  try {
    User.findByIdAndUpdate({_id:req.params.id}, 
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
      {_id:userId},
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
      {_id:userId},
      update,
      { new: true }
    );
    const userData = await User.findOne({ _id:userId });
    return res.json({ msg:"Device berhasil di Add",status: true, user:userData });
  } catch (ex) {
    next(ex);
  }
};

module.exports.removeDevice = async (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    const userId = req.params.id;

    const deleted = await User.findByIdAndUpdate ( 
      { "_id" : req.params.id} , 
      { "$pull" : { devices :  {_id: mongoose.Types.ObjectId(req.params.device) } }},
      { new: true }
    )
    console.log(deleted)
    return res.status(200).send({user:deleted,status: true});
  } catch (ex) {
    next(ex);
  }
};
