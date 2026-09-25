import productModel from "../models/product.model.js";
import { uploadProductImageService } from "../services/storage.service.js";

//controller for creating new product
const createProductController = async (req, res) => {
  try {
    //getting required info from request
    const { title, description, price, sizes } = req.body;
    const images = req.files;
    const { userId } = req.user;

    //checking if any image is uploaded or not
    if (!images || images.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
      });
    }

    //uploading images to cloud storage
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const result = await uploadProductImageService({ image });
        return result.url;
      }),
    );

    //creating product in database
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
    const products = await productModel.find();

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

export { createProductController, getProductsController };
