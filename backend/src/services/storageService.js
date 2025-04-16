const AWS = require('aws-sdk');
const { s3, bucketName } = require('../config/aws');

// Upload file to S3
exports.uploadFile = async (file, fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
};

// Delete file from S3
exports.deleteFile = async (fileUrl) => {
  // Extract key from file URL
  const key = fileUrl.split('/').pop();
  
  const params = {
    Bucket: bucketName,
    Key: key
  };
  
  await s3.deleteObject(params).promise();
};