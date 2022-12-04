const mongoose = require("mongoose");
const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
      read: {type:Boolean, default:false},
      attach: { type: String, required: false },
      type: { type: String, required: false },
      size: { type: String, required: false }
    },
    users: Array,
    channelId: {type:String, required:false},
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName:{type:String,default:null},
    senderPicture:{type:String,required:false}
  },
    {
      timestamps: true,
    }
  
);

module.exports = mongoose.model("Messages", MessageSchema);
