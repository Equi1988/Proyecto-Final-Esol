import mongoose from "mongoose";

const productosSchema = new mongoose.Schema(

    {
        title: String,
        description: String,
        code: {
            type: String,
            required: true,
            unique: true,
        },
        price: Number,
        stock: Number,
        category: String,
        thumbnails: [],
    },
    {
        timestamps: true,
        strict: false
    }
)

export const productsModels = mongoose.model(
    "productos",
    productosSchema    
    
)