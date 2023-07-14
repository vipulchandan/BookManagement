const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1"
})

// let uploadFile= async (file) =>{
//     return new Promise( function(resolve, reject) {
//         let s3= new AWS.S3({apiVersion: '2006-03-01'}); 

//         var uploadParams= {
//             ACL: "public-read",
//             Bucket: "classroom-training-bucket", 
//             Key: "abc/" + file.originalname, 
//             Body: file.buffer
//         }


//         s3.upload( uploadParams, function (err, data ){
//             if(err) {
//                 return reject({"error": err})
//             }
//             console.log(data)
//             console.log("file uploaded succesfully")
//             return resolve(data.Location)
//         })

//     })
// }

const uploadBookCover = async (file) => {
    try {
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  
      const uploadParams = {
        ACL: 'public-read',
        Bucket: 'classroom-training-bucket',
        Key: 'book/' + file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
      };
  
      const uploadResult = await s3.upload(uploadParams).promise();
  
      console.log(uploadResult);
      console.log('File uploaded successfully');
  
      return uploadResult.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
};

module.exports = {
    uploadBookCover
}