import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
    categories: [],
    currentCategory: null,
    loading: false,

    setCategories: (categories) => set({ categories }),

    fetchCategories: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/categories");
            const categoriesData = res.data.categories || res.data;
            
            // ✅ DEBUG: Console mein check karein ke image aa rahi hai ya nahi
            console.log("Categories from API:", categoriesData);
            categoriesData.forEach(cat => {
                console.log(`Category: ${cat.name}, Image: ${cat.image || "NO IMAGE"}`);
            });
            
            set({ categories: categoriesData, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error("Failed to fetch categories");
        }
    },

    fetchCategoryBySlug: async (slug) => {
        set({ loading: true });
        try {
            const res = await axios.get(`/categories/${slug}`);
            const category = res.data.category || res.data;
            set({ currentCategory: category, loading: false });
            return category;
        } catch (error) {
            set({ loading: false, currentCategory: null });
            toast.error("Failed to fetch category");
            return null;
        }
    },
    
    getCategoryBySlug: (slug) => {
        const { categories } = get();
        return categories.find(c => c.slug === slug) || null;
    }
}));