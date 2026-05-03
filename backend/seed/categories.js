import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { connectDB } from "../lib/db.js";

const categories = [
    {
        name: "Electronics",
        slug: "electronics",
        image: "/images/categories/electronics.jpg",
        description: "Latest gadgets and electronic devices",
        order: 1,
        subcategories: [
            { name: "Mobile Phones", slug: "mobile-phones", image: "/images/categories/mobiles.jpg" },
            { name: "Laptops", slug: "laptops", image: "/images/categories/laptops.jpg" },
            { name: "Headphones", slug: "headphones", image: "/images/categories/headphones.jpg" },
            { name: "Cameras", slug: "cameras", image: "/images/categories/cameras.jpg" },
            { name: "Smart Watches", slug: "smart-watches", image: "/images/categories/watches.jpg" },
        ],
    },
    {
        name: "Fashion",
        slug: "fashion",
        image: "/images/categories/fashion.jpg",
        description: "Trendy clothing and accessories",
        order: 2,
        subcategories: [
            { name: "Men", slug: "men", image: "/images/categories/men.jpg" },
            { name: "Women", slug: "women", image: "/images/categories/women.jpg" },
            { name: "Kids", slug: "kids", image: "/images/categories/kids.jpg" },
            { name: "Shoes", slug: "shoes", image: "/images/categories/shoes.jpg" },
            { name: "Accessories", slug: "accessories", image: "/images/categories/accessories.jpg" },
        ],
    },
    {
        name: "Home & Living",
        slug: "home-living",
        image: "/images/categories/home.jpg",
        description: "Everything for your home",
        order: 3,
        subcategories: [
            { name: "Furniture", slug: "furniture", image: "/images/categories/furniture.jpg" },
            { name: "Kitchen", slug: "kitchen", image: "/images/categories/kitchen.jpg" },
            { name: "Bedding", slug: "bedding", image: "/images/categories/bedding.jpg" },
            { name: "Decor", slug: "decor", image: "/images/categories/decor.jpg" },
        ],
    },
    {
        name: "Beauty & Health",
        slug: "beauty-health",
        image: "/images/categories/beauty.jpg",
        description: "Beauty and wellness products",
        order: 4,
        subcategories: [
            { name: "Makeup", slug: "makeup", image: "/images/categories/makeup.jpg" },
            { name: "Skincare", slug: "skincare", image: "/images/categories/skincare.jpg" },
            { name: "Hair Care", slug: "hair-care", image: "/images/categories/haircare.jpg" },
            { name: "Health", slug: "health", image: "/images/categories/health.jpg" },
        ],
    },
    {
        name: "Sports & Outdoor",
        slug: "sports-outdoor",
        image: "/images/categories/sports.jpg",
        description: "Sports gear and outdoor equipment",
        order: 5,
        subcategories: [
            { name: "Gym Equipment", slug: "gym", image: "/images/categories/gym.jpg" },
            { name: "Sports", slug: "sports", image: "/images/categories/sports-equip.jpg" },
            { name: "Outdoor", slug: "outdoor", image: "/images/categories/outdoor.jpg" },
        ],
    },
    {
        name: "Books & Stationery",
        slug: "books-stationery",
        image: "/images/categories/books.jpg",
        description: "Books, stationery and art supplies",
        order: 6,
        subcategories: [
            { name: "Books", slug: "books", image: "/images/categories/books-cat.jpg" },
            { name: "Stationery", slug: "stationery", image: "/images/categories/stationery.jpg" },
            { name: "Art Supplies", slug: "art", image: "/images/categories/art.jpg" },
        ],
    },
];

const seedCategories = async () => {
    try {
        await connectDB();
        await Category.deleteMany({});
        await Category.insertMany(categories);
        console.log("✅ Categories seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding categories:", error);
        process.exit(1);
    }
};

seedCategories();