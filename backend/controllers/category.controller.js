import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

// ============================================
// 1. GET ALL CATEGORIES 
// ============================================
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ order: 1 }).select("-__v").lean();
        
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const subcategoriesWithCount = await Promise.all(
                    (category.subcategories || []).map(async (sub) => {
                        const count = await Product.countDocuments({
                            "category.main": category.slug,
                            "category.sub": sub.slug,
                            isActive: true
                        });
                        
                        return {
                            ...sub,
                            itemCount: count
                        };
                    })
                );
                
                return {
                    ...category,
                    subcategories: subcategoriesWithCount
                };
            })
        );
        
        res.json({ categories: categoriesWithCount });
    } catch (error) {
        console.log("Error in getAllCategories:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ============================================
// 2. GET CATEGORY BY SLUG 
// ============================================
export const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const category = await Category.findOne({ slug, isActive: true }).select("-__v").lean();
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Subcategories ke product count add kiye
        const subcategoriesWithCount = await Promise.all(
            (category.subcategories || []).map(async (sub) => {
                const count = await Product.countDocuments({
                    "category.main": category.slug,
                    "category.sub": sub.slug,
                    isActive: true
                });
                
                return {
                    ...sub,
                    itemCount: count
                };
            })
        );

        res.json({ 
            category: {
                ...category,
                subcategories: subcategoriesWithCount
            }
        });
    } catch (error) {
        console.log("Error in getCategoryBySlug:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ============================================
// 3. CREATE CATEGORY 
// ============================================
export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, image, subcategories, order } = req.body;

        // Check if slug already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({ message: "Category with this slug already exists" });
        }

        const newCategory = new Category({
            name,
            slug,
            description,
            image,
            subcategories: subcategories || [],
            order: order || 0,
            isActive: true
        });

        await newCategory.save();

        res.status(201).json({ 
            message: "Category created successfully",
            category: newCategory 
        });
    } catch (error) {
        console.log("Error in createCategory:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ============================================
// 4. UPDATE CATEGORY 
// ============================================
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, image, subcategories, order, isActive } = req.body;

        // If slug is being changed, check for duplicates
        if (slug) {
            const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
            if (existingCategory) {
                return res.status(400).json({ message: "Category with this slug already exists" });
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                name,
                slug,
                description,
                image,
                subcategories,
                order,
                isActive
            },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ 
            message: "Category updated successfully",
            category: updatedCategory 
        });
    } catch (error) {
        console.log("Error in updateCategory:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ============================================
// 5. DELETE CATEGORY 
// ============================================
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if products exist in this category
        const productCount = await Product.countDocuments({
            "category.main": category.slug,
            isActive: true
        });

        if (productCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete category. ${productCount} active products exist in this category.` 
            });
        }

        // Soft delete (recommended) - mark as inactive
        await Category.findByIdAndUpdate(id, { isActive: false });
        
        // Hard delete ke liye neeche wali line use karo (agar chaho):
        // await Category.findByIdAndDelete(id);

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.log("Error in deleteCategory:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};