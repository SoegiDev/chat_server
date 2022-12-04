const mongoose = require("mongoose");
const ChannelSchema = mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true,
      },
    participants: {
        type: Number,
        default: 0,
    },
    sockets: Array,
    active: {
        type: Boolean,
        default: true,
    },
    isAvatarImageSet: {
        type: Boolean,
        default: false,
    },
    avatarImage: {
        type: String,
        default: "",
    },
  },
    {
      timestamps: true,
    }
  
);

module.exports = mongoose.model("Channels", ChannelSchema);
