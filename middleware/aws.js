
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const bucketName = "chatimage2022";
const path = "chatimage2022"
const folder = "image_chat"
const region = "";
const accessKeyId = "X2SL8IYOBBRLGIM0ISUI";
const S3_ENDPOINT_URL="https://is3.cloudhost.id/"
const secretAccessKey = "zGaWUJ2ToAvIAhEfNS6DvPlWDaPdJyiCqws0hpWf";
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
    Bucket: folder,
    Body: fileStream,
    ACL: 'public-read',
    Key: file.filename,
  };
return s3.upload(uploadParams).promise(); // this will upload file to S3
}

module.exports = {uploadFileS3};