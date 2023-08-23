const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { isValidObjectId } = require("mongoose");
const CustomError = require("../errors");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const { deleteProductImage } = require("../utils")


const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    return res.status(StatusCodes.CREATED).json({ product });
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({});
    return res.status(StatusCodes.OK).json({ products });
}

const getSingleProduct = async (req, res) => {
    const { id: _id } = req.params;

    if(!_id || !isValidObjectId(_id)) {
        throw new CustomError.BadRequestError(`Invalid Product Id: ${_id}`)
    }

    // * Get Reviews associated with product
    const product = await Product.findOne({ _id }).populate('reviews');

    if(!product) {
        throw new CustomError.BadRequestError(`No product with Id: ${_id}`)
    }


    return res.status(StatusCodes.OK).json({ product });
}

const updateProduct = async (req, res) => {
    const { id: _id } = req.params;

    if(!_id || !isValidObjectId(_id)) {
        throw new CustomError.BadRequestError(`Invalid Product Id: ${_id}`)
    }

    const product = await Product.findOneAndUpdate({ _id }, req.body, { new: true, runValidators: true });

    if(!product) {
        throw new CustomError.BadRequestError(`No product with Id: ${_id}`)
    }


    return res.status(StatusCodes.OK).json({ product });
}

const deleteProduct = async (req, res) => {
    const { id: _id } = req.params;

    if(!_id || !isValidObjectId(_id)) {
        throw new CustomError.BadRequestError(`Invalid Product Id: ${_id}`)
    }

    const product = await Product.findOne({ _id });

    if(!product) {
        throw new CustomError.BadRequestError(`No product with Id: ${_id}`)
    }

    console.log(product);

    const result = await Promise.all([product.remove(), deleteProductImage(product.image)]);

    console.log(result);

    return res.status(StatusCodes.OK).json({ msg: "Product deleted Successfully." });
}

// * Locally sets Image
const uploadImageLocal = async (req, res) => {
    if(!req.files) {
        throw new CustomError.BadRequestError("No File uploaded");
    }

    const productImage = req.files.image;

    if(!productImage.mimetype.startsWith("image")) {
        throw new CustomError.BadRequestError("Only image supported");
    }

    const maxSize = 1024 * 1024;
    
    if(productImage.size > maxSize) {
        throw new CustomError.BadRequestError("Max image size is 1MB");
    }

    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

    await productImage.mv(imagePath);

    return res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
}

// * Uploads to Cloudinary
const uploadImage = async (req, res) => {
    console.log(req.files);
    if(!req.files) {
        throw new CustomError.BadRequestError("No File uploaded");
    }

    const productImage = req.files.image;

    if(!productImage.mimetype.startsWith("image")) {
        throw new CustomError.BadRequestError("Only image supported");
    }

    const maxSize = 1024 * 1024;
    
    if(productImage.size > maxSize) {
        throw new CustomError.BadRequestError("Max image size is 1MB");
    }

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: true,
        filename_override: productImage.name,
        folder: process.env.CLOUD_UPLOAD_FOLDER
    });

    fs.unlinkSync(req.files.image.tempFilePath);

    console.log(result);

    return res.status(StatusCodes.OK).json({ image: result.secure_url });
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}