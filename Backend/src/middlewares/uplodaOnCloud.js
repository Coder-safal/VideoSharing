
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,  // Click 'View API Keys' above to copy your API secret
});

// Upload an image

const uplodaOnCloudinary = async (localPath) => {
    try {
        if (!localPath) {
            return null;
        }
        const uploadResult = await cloudinary.uploader.upload(localPath)//,{resourse_type:file}

        fs.unlinkSync(localPath);
        return uploadResult;

    } catch (error) {

        console.log("Some errors occurs while uploading on cloudinary")
        // fs.unlinkSync(localPath);
        return null;

    }
}
const uplodaVideosOnCloudinary = async (localPath) => {
    try {
        if (!localPath) {
            return null;
        }
        const uploadResult = await cloudinary.uploader.upload(
            localPath,
            {
                resource_type: 'video',
            }
        )//,{resourse_type:file}

        fs.unlinkSync(localPath);
        return uploadResult;

    } catch (error) {

        fs.unlinkSync(localPath);
        console.log("Some errors occurs while uploading on cloudinary")
        // fs.unlinkSync(localPath);
        return null;

    }
}


const deleteInCloudinary = async (image_public_id) => {
    return await cloudinary.uploader.destroy(image_public_id);
}


const getPublicIdFromUrl = (url) => {
    // Split the URL to get the part after /upload/
    const parts = url.split('/');
    // Remove the version if it exists
    const version = parts[parts.length - 2].startsWith('v') ? parts.splice(parts.length - 2, 1) : null;
    // Extract the public_id
    const publicIdWithExtension = parts.pop();
    // Remove the file extension to get the public_id
    const publicId = publicIdWithExtension.split('.')[0];

    return publicId;
}

export {
    uplodaOnCloudinary, deleteInCloudinary,
    uplodaVideosOnCloudinary, getPublicIdFromUrl
};