const {
  login,
  register,
  getAllUsers,
  getAllFriends,
  setAvatar,
  logOut,
  updateConnected,
  addFriends,
  getFriendsMandatory
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.get("/allfriends/:id", getAllFriends);
router.get("/friendsmandatory/:id", getFriendsMandatory);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
router.post("/update_connect/:id", updateConnected);
router.post("/add_friend/:id", addFriends);

module.exports = router;
