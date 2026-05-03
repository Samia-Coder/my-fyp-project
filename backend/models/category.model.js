import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        image: { type: String, default: "" },
        description: { type: String, default: "" },
        subcategories: [
            {
                name: { type: String, required: true },
                slug: { type: String, required: true },
                image: { type: String, default: "" },
            },
        ],
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;