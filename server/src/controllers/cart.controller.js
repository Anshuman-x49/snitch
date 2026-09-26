import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

// add to cart controller
const addToCartController = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const userId = req.user.id;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const sizeSelected = product.sizes.find((item) => item.size === size);

    if (!sizeSelected) {
      return res.status(404).json({
        message: "Size not found",
      });
    }

    if (sizeSelected.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    const cart =
      (await cartModel.findOne({ user: userId })) ??
      (await cartModel.create({ user: userId }));

    const productInCart = cart.products.find(
      (item) => item.product.toString() === productId && item.size === size,
    );

    if (productInCart) {
      if (productInCart.quantity + quantity > sizeSelected.quantity) {
        return res.status(400).json({
          message: "Insufficient stock for this size",
        });
      }

      await cartModel.updateOne(
        {
          user: userId,
          "products.product": productId,
          "products.size": size,
        },
        { $inc: { "products.$.quantity": quantity } },
      );
    }

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
    const userId = req.user.id;

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

export { addToCartController, getCartController };
