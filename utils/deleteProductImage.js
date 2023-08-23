const { v2: cloudinary } = require("cloudinary");


const deleteProductImage = async (url) => {
    if(!url.includes(process.env.CLOUD_UPLOAD_FOLDER)) {
        return Promise.resolve({ result: 'ok' })
    }
    const payload = url.split("/");
    const publicId = payload[payload.length-2]+'/'+payload[payload.length-1].split(".")[0];
    return await cloudinary.uploader.destroy(publicId) 
}


module.exports = deleteProductImage;