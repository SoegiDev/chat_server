const { getAllMember,getAllChannels,addChannels,addMember } = require("../controllers/channelController");
const router = require("express").Router();
router.get("/getallchannels/", getAllChannels);
router.post("/addchannel/:id", addChannels);
router.post("/addmember/:id", addMember);
router.get("/allmember/:id",getAllMember)
module.exports = router;
