const {
  login,
  register,
  getAllUsers,
  getAllFriends,
  setAvatar,
  logOut,
  updateConnected,
  addFriends,
  getFriendsMandatory,
  addDevices,
  removeDevice,
  getDevices
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.get("/allfriends/:id", getAllFriends);
router.get("/friendsmandatory/:id", getFriendsMandatory);
router.post("/setavatar/:id", setAvatar);
router.post("/logout/:id/:device", logOut);
router.post("/remove_device/:id/:device", removeDevice);
router.post("/update_connect/:id", updateConnected);
router.post("/add_friend/:id", addFriends);
router.post("/add_device/:id", addDevices);
router.get("/get_device/:id", getDevices);

module.exports = router;
