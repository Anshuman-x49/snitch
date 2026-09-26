import express from "express";
import { authenticationMiddleware } from "../middlewares/auth.middleware.js";
import { addToCartValidator } from "../validators/cart.validator.js";
import {
  addToCartController,
  getCartController,
} from "../controllers/cart.controller.js";

const router = express.Router();

/**
 * @description Route for adding a product to the cart
 * @method POST
 * @url /api/cart/add
 * @access protected
 */
router.post(
  "/add",
  authenticationMiddleware,
  addToCartValidator,
  addToCartController,
);

/**
 * @description Route for getting the user's cart
 * @method GET
 * @url /api/cart/
 * @access protected
 */
router.get("/", authenticationMiddleware, getCartController);

export default router;
