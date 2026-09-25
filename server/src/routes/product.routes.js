import express from "express";
import { authenticationMiddleware } from "../middlewares/auth.middleware.js";
import { createProductController, getProductsController } from "../controllers/product.controllers.js";
import multer from "multer";
import { createProductValidator } from "../validators/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5, // max 5 files
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedType = ["image/png", "image/jpeg", "image/jpg"];
    if (allowedType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

const router = express.Router();

/**
 * @description Route for seller creating a new product
 * @method POST
 * @url /api/products/create
 * @access protected(seller only)
 */
router.post(
  "/",
  authenticationMiddleware,
  (req, res, next) => {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "You are not authorized to create a product",
      });
    }
    next();
  },
  upload.array("images"),
  (req, res, next) => {
    req.body?.price && (req.body.price = JSON.parse(req.body.price));
    req.body?.sizes && (req.body.sizes = JSON.parse(req.body.sizes));
    next();
  },
  createProductValidator,
  createProductController,
);

/**
 * @description Route for getting all products
 * @method GET
 * @url /api/products
 * @access public
 */
router.get("/", getProductsController);

export default router;
