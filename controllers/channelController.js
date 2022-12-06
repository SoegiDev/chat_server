const Channel = require("../models/channelModel");
const User = require("../models/userModel")
const bcrypt = require("bcrypt");

module.exports.getAllChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find().select([
      "name",
      "participants",
      "sockets",
      "active",
      "isAvatarImageSet",
      "avatarImage",
      "_id",
    ]).sort({ updatedAt: 1 });
    return res.json(channels);
  } catch (ex) {
    next(ex);
  }
};
module.exports.getAllMember = async (req, res, next) => {
  try {
    const channels = await Channel.findOne({_id:req.params.id}).select([
      "_id",
      "name",
      "sockets"
    ]);
    return res.json(channels);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addChannels = async (req, res, next) => {
    try {
      const { name } = req.body;
      const userId = req.params.id;
      const nameCheck = await Channel.findOne({ name });
      const usernameCheck = await User.findOne({ _id:userId });
      if (nameCheck)return res.json({ msg: "Nama Channel sudah ada ",success:false });
      const ChannelData = await Channel.create({
        name,
        active: true,
        participants: 1,
        isAvatarImageSet:true,
        avatarImage:"data:image/png;base64,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",
        sockets: [{ _id: usernameCheck._id,username:usernameCheck.username, isAdmin: true, block:false }]
      });
      return res.json({ msg:"Channel berhasil di tambahkan",status: true, ChannelData });
    } catch (ex) {
      next(ex);
    }
  };

module.exports.addMember = async (req, res, next) => {
    try {
      const { name } = req.body;
      const channelId = req.params.id;
      const usernameCheck = await User.findOne({$or: [
        {username: username},
        {pin: username}
        ]});
      if (!usernameCheck)return res.json({ msg: "Member tidak ditemukan ",success:false });
      console.log(channelId)
      var update = {
        $addToSet: { sockets: { _id: usernameCheck._id, username:usernameCheck.username,isAdmin: false, block:false } }
      }
      const ChannelData = await Channel.findByIdAndUpdate(
        channelId,
        update,
        { new: true }
      );
      return res.json({ msg:"Member berhasil ditambahkan",status: true, ChannelData });
    } catch (ex) {
      next(ex);
    }
  };