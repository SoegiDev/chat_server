const multer = require("multer");
var fs = require("fs");
const path = require('path');
const dirPath = path.join(__dirname, '../assets/uploads');
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

module.exports = upload;