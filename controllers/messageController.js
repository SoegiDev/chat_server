const Messages = require("../models/messageModel");
const User = require("../models/userModel")
const Channel = require("../models/channelModel")
const uploadFile = require("../middleware/upload");

// S3 STORAGE //
const { uploadFileS3, getFileStream } = require("../middleware/aws");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    console.log("message",from,to)
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        id:msg._id,
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        attach: msg.message.attach,
        type: msg.message.file_type,
        size: msg.message.file_size,
        createdAt:msg.createdAt,
        read:msg.message.read,
        senderName:msg.senderName,
        senderPicture:msg.senderPicture
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};


module.exports.getMessagesChannel = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    console.log("message",from,to)
    const messages = await Messages.find({
      users: {
        $all: [to],
      },
    }).sort({ createdAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        id:msg._id,
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        attach: msg.message.attach,
        type: msg.message.file_type,
        size: msg.message.file_size,
        createdAt:msg.createdAt,
        read:msg.message.read,
        senderName:msg.senderName,
        senderPicture:msg.senderPicture
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};



module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message,attach,attach_type,attach_size } = req.body;
    const getFrom = await User.findOne({ _id: from});
    const data = await Messages.create({
      message: { text: message, attach:attach, type:attach_type, size:attach_size },
      users: [from, to],
      sender: from,
      senderName: getFrom.username,
      senderPicture:getFrom.avatarImage
    });
    let dateChat = new Date(Date.now())
    const getFriend = await User.findOne({ _id: to});
    var update = {chatUpdatedAt: new Date()};
    if(getFriend.friends.length > 0){
      let updateFriends = await User.findOneAndUpdate(
        {_id:getFriend._id},
        { 
          "$set": {[`friends.$[outer].chatUpdatedAt`]: new Date()} 
        },
        { 
          "arrayFilters": [{ "outer._id": getFrom._id }]
        }
      );
    }
    

    if (data) return res.json({ msg: "Message added successfully.",data});
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessageChannel = async (req, res, next) => {
  try {
    const { from, to, message,attach,attach_type,attach_size } = req.body;
    const getFrom = await User.findOne({ _id: from});
    const data = await Messages.create({
      message: { text: message, attach:attach, type:attach_type, size:attach_size },
      users: [from, to],
      sender: from,
      senderName: getFrom.username,
      senderPicture:getFrom.avatarImage
    });
    if (data) return res.json({ msg: "Message added successfully.",data});
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.uploadImage = async (req, res, next) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({data:req.file.location,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};


module.exports.uploadImageAws = async (req, res, next) => {
  console.log(req.file);

  // uploading to AWS S3
  const result = await uploadFileS3(req.file);
  console.log("S3 response", result);

  // You may apply filter, resize image before sending to client

  // Deleting from local if uploaded in S3 bucket
  await unlinkFile(req.file.path);

  res.send({
    status: "success",
    message: "File uploaded successfully",
    data: result,
  });
};

module.exports.countMessage = async (req, res, next) => {
  try {
    const from = req.params.from 
    const to = req.params.to
    const data_count = await Messages.find({
        users:[from,to],'message.read':false,
    }).count();
    return res.json(data_count);
  } catch (ex) {
    next(ex);
  }
};
module.exports.countMessageChannel = async (req, res, next) => {
  try {
    const from = req.params.from 
    const to = req.params.to
    const data_count = await Messages.find({
        users:[to],'message.read':false,
    }).count();
    return res.json(data_count);
  } catch (ex) {
    next(ex);
  }
};

module.exports.updateReadMessage = (req, res, next) => {
  try {
    Messages.findByIdAndUpdate(req.params.id, 
      {'message.read':true}, function(err, data) {
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