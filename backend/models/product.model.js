import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            min: 0,
            required: true,
        },
        image: {
            type: String,
            required: [true, "Image is required"],
        },
        images: [{  // ← Multiple images support
            type: String,
        }],
        category: {
            main: {
                type: String,
                required: true,
                index: true,
            },
            sub: {
                type: String,
                required: true,
                index: true,
            },
            type: {
                type: String,
                default: "",
            },
        },
        brand: {
            type: String,
            default: "",
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        ratings: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tags: [{  // ← For search/filter
            type: String,
        }],
    },
    { timestamps: true }
);

// Index for faster queries
productSchema.index({ "category.main": 1, "category.sub": 1 });
productSchema.index({ isFeatured: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;