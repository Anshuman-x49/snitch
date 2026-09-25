import { body, validationResult } from "express-validator";

const createProductValidator = [
  body("title")
    .exists()
    .withMessage("Title is required")
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product title must be between 2 and 100 characters long")
    .isAlpha("en-US", { ignore: " " })
    .bail()
    .withMessage("Product name must contain only alphabetic characters and spaces"),

  body("description")
    .exists()
    .withMessage("Description is required")
    .bail()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters long"),

  body("price.amount")
    .exists()
    .withMessage("Price amount is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Price amount must be a non-negative number"),

  body("price.currency")
    .exists()
    .withMessage("Currency is required")
    .bail()
    .isString()
    .withMessage("Currency must be a string")
    .bail()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be either INR or USD"),

  body("sizes")
    .exists()
    .withMessage("Sizes are required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("Sizes must be an array containing at least one size"),

  body("sizes.*.size")
    .exists()
    .withMessage("Size name is required")
    .bail()
    .isString()
    .withMessage("Size name must be a string")
    .bail()
    .trim()
    .toUpperCase()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be one of XS, S, M, L, XL, XXL"),

  body("sizes.*.stock")
    .exists()
    .withMessage("Stock is required for each size")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Stock for each size must be a non-negative integer"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid request",
        errors: errors.array(),
      });
    }
    next();
  },
];

export { createProductValidator };
