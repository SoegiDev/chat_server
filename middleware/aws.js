
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const bucketName = "zx16";
const path = "chatimage2022"
const region = "";
const accessKeyId = "DO00JZA2WMEFT8E47QEF";
const S3_ENDPOINT_URL="https://sgp1.digitaloceanspaces.com/"
const secretAccessKey = "uKY93aeBGGMgOYYCOY2PfZgjK3/PVBk1vsmFD4TdQ6M";
const s3 = new S3({
    apiVersion: 'latest',
    endpoint: `${S3_ENDPOINT_URL}${path}`,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

// UPLOAD FILE TO S3*
function uploadFileS3(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    ACL: 'public-read',
    Key: file.filename,
  };
return s3.upload(uploadParams).promise(); // this will upload file to S3
}

module.exports = {uploadFileS3};