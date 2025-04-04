import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {

            _id:false,
            product: { type: mongoose.Schema.Types.ObjectId, ref: "productos" },
            quantity: { type: Number, default: 1 },
        },
    ],
});

export const cartsModels = mongoose.model("Carts", cartSchema);
