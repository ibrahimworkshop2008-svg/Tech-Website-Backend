const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE, // This is the default and can be omitted
});


// async function uploadImage(buffer) {
//     const result = await client.files.upload({
//         file: buffer.toString("base64"), // Convert buffer to base64 string
//         fileName: 'image.jpg', // You can provide a custom file name here
//     });
//     return result.url; // Return the URL of the uploaded image
// }

module.exports =  client;
