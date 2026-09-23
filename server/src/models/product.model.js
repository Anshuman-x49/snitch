import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: [2, "Name must be at least 2 characters long"],
      max: [100, "Name cannot be more than 100 characters long"],
    },
    description: {
      type: String,
      required: true,
      min: [10, "Description must be at least 10 characters long"],
      max: [500, "Description cannot be more than 500 characters long"],
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
      },
      currency: {
        type: String,
        required: true,
        enum: ["INR", "USD"],
        default: "INR",
      },
    },
    images: {
      type: [String],
      validate: [
        {
          validator: function (val) {
            return val.length <= 5;
          },
          message: "A maximum of 5 image links can be stored",
        },
      ],
    },
    sizes: [
      {
        size: {
          type: String,
          required: true,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
        },
        stock: {
          type: Number,
          required: true,
          min: [0, "Stock cannot be negative"],
          default: 0,
        },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const productModel = mongoose.model("product", productSchema);

export default productModel;
