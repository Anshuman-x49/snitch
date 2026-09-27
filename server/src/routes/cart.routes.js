import express from "express";
import { authenticationMiddleware } from "../middlewares/auth.middleware.js";
import {
  addToCartValidator,
  removeFromCartValidator,
} from "../validators/cart.validator.js";
import {
  addToCartController,
  getCartController,
  removeFromCartController,
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
 * @description Route for removing a product from the cart
 * @method POST
 * @url /api/cart/:id
 * @access protected
 */
router.post(
  "/:id",
  authenticationMiddleware,
  removeFromCartValidator,
  removeFromCartController,
);

/**
 * @description Route for getting the user's cart
 * @method GET
 * @url /api/cart/
 * @access protected
 */
router.get("/", authenticationMiddleware, getCartController);

export default router;
