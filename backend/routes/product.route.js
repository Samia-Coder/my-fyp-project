import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getFeaturedProducts,
    getProductsByCategory,
    getProductsBySubCategory,
    getRecommendedProducts,
    toggleFeaturedProduct,
    searchProducts
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ===== SEARCH ROUTE (Sabse pehle) =====
router.get("/search", searchProducts);

// ===== GET SINGLE PRODUCT BY ID =====
router.get("/get/:id", async (req, res) => {
    try {
        const Product = (await import("../models/product.model.js")).default;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ===== CATEGORY ROUTES =====
router.get("/category/:category", getProductsByCategory);
router.get("/category/:category/:subcategory", getProductsBySubCategory);

// ===== OTHER ROUTES =====
router.get("/get", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;