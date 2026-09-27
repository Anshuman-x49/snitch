import productModel from "../models/product.model.js";
import { uploadProductImageService } from "../services/storage.service.js";

//controller for creating new product
const createProductController = async (req, res) => {
  try {
    // getting product details from request body
    const { title, description, price, sizes } = req.body;
    // get images from request
    const images = req.files;
    // get user id from request
    const { userId } = req.user;

    // checking if any image is uploaded or not
    if (!images || images.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
      });
    }

    // uploading images to cloud storage using promise.all for parallel upload
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const result = await uploadProductImageService({ image });
        return result.url;
      }),
    );

    // creating product in database
    const product = await productModel.create({
      title,
      description,
      price,
      sizes,
      images: imageUrls,
      seller: userId,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while creating product",
      error: error.message,
    });
  }
};

//controller for getting all products
const getProductsController = async (req, res) => {
  try {
    //getting products from database
    const products = await productModel.find({ isPublished: true });

    //checking if any product is found or not
    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    return res.status(200).json({
      message: "Products fetched successfully",
      data: {
        products,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while getting products",
      error: error.message,
    });
  }
};

//controller for updating product
const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.userId;

    // finding product and checking ownership
    const product = await productModel.findOneAndUpdate(
      { _id: id, seller: userId },
      updates,
      { new: true },
    );
    // checking if product is found or not
    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not the owner",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while updating product",
      error: error.message,
    });
  }
};

//controller for listing product
const listProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // finding product and checking ownership
    const product = await productModel.findOneAndUpdate(
      { _id: id, seller: userId },
      { isPublished: true },
      { new: true },
    );

    // checking if product is found or not
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product listed successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while listing product",
      error: error.message,
    });
  }
};

//controller for unlisting product
const unlistProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // finding product and checking ownership
    const product = await productModel.findOneAndUpdate(
      { _id: id, seller: userId },
      { isPublished: false },
      { new: true },
    );

    // checking if product is found or not
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product unlisted successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while unlisting product",
      error: error.message,
    });
  }
};

export {
  createProductController,
  getProductsController,
  updateProductController,
  listProductController,
  unlistProductController,
};
