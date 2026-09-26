import { body, validationResult } from "express-validator";

const addToCartValidator = [
  body("productId")
    .exists()
    .withMessage("Product ID is required")
    .bail()
    .isString()
    .withMessage("Product ID must be a string")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("quantity")
    .exists()
    .withMessage("Quantity is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("size")
    .exists()
    .withMessage("Size is required")
    .bail()
    .isString()
    .withMessage("Size must be a string")
    .bail()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be one of XS, S, M, L, XL, XXL"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { addToCartValidator };
