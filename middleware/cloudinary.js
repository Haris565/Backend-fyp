const configs = require ('config');
var cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name : configs.get("CLOUDINARY_NAME"),
    api_key : configs.get("CLOUDINARY_API"),
    api_secret : configs.get("CLOUDINARY_SECRET")

})

module.exports = {cloudinary}



