import AWS from 'aws-sdk'

AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.S3_REGION,
  });

export const s3 = new AWS.S3();