import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

// add to cart controller
const addToCartController = async (req, res) => {
  try {
    // get product details and quantity from request body
    const { id, quantity, size } = req.body;
    // get user id from request
    const userId = req.user.id;

    // get product from database
    const product = await productModel.findOne({
      _id: id,
      isPublished: true,
    });

    // if product is not found
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // find selected size in product
    const sizeSelected = product.sizes.find((item) => item.size === size);

    // if size is not found
    if (!sizeSelected) {
      return res.status(404).json({
        message: "Size not found",
      });
    }

    // check if quantity is less than stock
    if (sizeSelected.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    // get cart from database or create new cart
    const cart =
      (await cartModel.findOne({ user: userId })) ??
      (await cartModel.create({ user: userId }));

    // check if product is already in cart
    const productInCart = cart.products.find(
      (item) => item.product.toString() === productId && item.size === size,
    );

    if (productInCart) {
      // check if quantity is less than stock
      if (productInCart.quantity + quantity > sizeSelected.quantity) {
        return res.status(400).json({
          message: "Insufficient stock for this size",
        });
      }

      // if product is already in cart, update the quantity
      await cartModel.updateOne(
        {
          user: userId,
          "products.product": productId,
          "products.size": size,
        },
        { $inc: { "products.$.quantity": quantity } },
      );
    }

    // if product is not in cart, add it
    await cartModel.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $push: {
          products: {
            product: productId,
            quantity,
            size,
          },
        },
      },
    );

    return res.status(200).json({
      message: "Product added to cart successfully",
      data: {
        cart,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error adding product to cart",
      error: error.message,
    });
  }
};

// controller for getting the user's cart
const getCartController = async (req, res) => {
  try {
    // get user id from request
    const userId = req.user.id;

    // get cart from database or create new cart
    const cart =
      (await cartModel.findOne({ user: userId })) ??
      (await cartModel.create({ user: userId }));

    return res.status(200).json({
      message: "cart retrieved successfully",
      data: {
        cart,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while getting cart",
      error: error.message,
    });
  }
};

// controller for removing product from cart
const removeFromCartController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cart = await cartModel.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          products: {
            product: id,
          },
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Product removed from cart successfully",
      data: {
        cart,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while removing product from cart",
      error: error.message,
    });
  }
};

export { addToCartController, getCartController, removeFromCartController };
