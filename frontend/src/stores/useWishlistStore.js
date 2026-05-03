import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export const useWishlistStore = create(
    persist(
        (set, get) => ({
            wishlist: [],

            // Check if product is in wishlist
            isInWishlist: (productId) => {
                return get().wishlist.some((item) => item._id === productId || item.id === productId);
            },

            // Add to wishlist
            addToWishlist: (product) => {
                const exists = get().wishlist.some((item) => item._id === product._id || item.id === product._id);
                if (exists) {
                    toast.error("Already in wishlist!");
                    return;
                }
                set((state) => ({
                    wishlist: [...state.wishlist, product],
                }));
                toast.success("Added to wishlist!");
            },

            // Remove from wishlist
            removeFromWishlist: (productId) => {
                set((state) => ({
                    wishlist: state.wishlist.filter((item) => item._id !== productId && item.id !== productId),
                }));
                toast.success("Removed from wishlist!");
            },

            // Toggle wishlist (add if not exists, remove if exists)
            toggleWishlist: (product) => {
                const exists = get().wishlist.some((item) => item._id === product._id || item.id === product._id);
                if (exists) {
                    get().removeFromWishlist(product._id || product.id);
                } else {
                    get().addToWishlist(product);
                }
            },

            // Clear wishlist
            clearWishlist: () => {
                set({ wishlist: [] });
                toast.success("Wishlist cleared!");
            },
        }),
        {
            name: "wishlist-storage", // localStorage key
        }
    )
);