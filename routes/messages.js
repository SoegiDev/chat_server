const { addMessage, getMessages,getMessagesChannel, updateReadMessage,countMessage,countMessageChannel,uploadImage,uploadImageAws,addMessageChannel } = require("../controllers/messageController");
const router = require("express").Router();
const upload = require("../middleware/common");
router.post("/addmsg/", addMessage);
router.post("/addmsgchannel/", addMessageChannel);
router.post("/getmsg/", getMessages);
router.post("/getmsgchannel/", getMessagesChannel);
router.get("/count_msg/:from&:to", countMessage);
router.get("/count_msg_channel/:from&:to", countMessageChannel);
router.post("/uploadimage",uploadImage);
router.post("/uploadimageaws", upload.single("image"),uploadImageAws);
router.post("/updateReadMessage/:id", updateReadMessage);

module.exports = router;
