import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft, ShoppingBag, Trash2, Package, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import toast from "react-hot-toast";

const WishlistPage = () => {
    const { user } = useUserStore();
    const { addToCart } = useCartStore();
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for smooth transition
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = (productId) => {
        removeFromWishlist(productId);
    };

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success("Added to cart!");
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear your wishlist?")) {
            clearWishlist();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F5] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#F8BBD9]/30 border-t-[#C2185B] rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F5] px-4 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <motion.button
                                className="p-3 bg-white rounded-2xl shadow-lg text-[#C2185B] border border-[#F8BBD9]/30"
                                whileHover={{ scale: 1.1, x: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft size={22} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-[#880E4F] flex items-center gap-2">
                                <Heart size={32} className="text-[#C2185B] fill-[#C2185B]" />
                                My Wishlist
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                            </p>
                        </div>
                    </div>
                    
                    {wishlist.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClearAll}
                            className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors border border-red-200 shadow-sm"
                        >
                            Clear All
                        </motion.button>
                    )}
                </motion.div>

                {wishlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center border border-[#F8BBD9]/40 shadow-xl"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Heart size={80} className="text-[#F8BBD9] mx-auto mb-6" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-[#880E4F] mb-3">Your Wishlist is Empty</h2>
                        <p className="text-gray-500 mb-8 text-lg">Save items you love and they'll appear here.</p>
                        <Link to="/">
                            <motion.button
                                className="bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#C2185B]/30"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles size={20} />
                                    Browse Products
                                </span>
                            </motion.button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.08 }
                            }
                        }}
                    >
                        <AnimatePresence>
                            {wishlist.map((item, idx) => (
                                <motion.div
                                    key={item._id || item.id || idx}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                    className="bg-white rounded-2xl p-5 border border-[#F8BBD9]/30 shadow-lg hover:shadow-xl transition-shadow group"
                                >
                                    <div className="flex items-center gap-5">
                                        {/* Image */}
                                        <Link to={`/product/${item._id || item.id}`} className="shrink-0">
                                            <motion.div 
                                                className="w-24 h-24 bg-gradient-to-br from-[#FFF5F7] to-[#FCE4EC] rounded-2xl flex items-center justify-center overflow-hidden border-2 border-[#F8BBD9]/30 group-hover:border-[#C2185B]/50 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={36} className="text-[#F8BBD9]" />
                                                )}
                                            </motion.div>
                                        </Link>
                                        
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${item._id || item.id}`}>
                                                <h3 className="font-bold text-[#880E4F] truncate text-lg group-hover:text-[#C2185B] transition-colors">
                                                    {item.name || "Product"}
                                                </h3>
                                            </Link>
                                            <p className="text-2xl font-black text-[#C2185B] mt-1">
                                                ${item.price?.toFixed(2) || "0.00"}
                                            </p>
                                            {item.originalPrice && (
                                                <p className="text-sm text-gray-400 line-through">
                                                    ${item.originalPrice.toFixed(2)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <motion.button
                                                onClick={() => handleAddToCart(item)}
                                                className="p-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Add to Cart"
                                            >
                                                <ShoppingBag size={20} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleRemove(item._id || item.id)}
                                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Remove"
                                            >
                                                <Trash2 size={20} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Continue Shopping */}
                {wishlist.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 text-center"
                    >
                        <Link to="/">
                            <motion.span
                                className="inline-flex items-center gap-2 text-[#C2185B] font-bold hover:text-[#880E4F] transition-colors"
                                whileHover={{ x: 5 }}
                            >
                                <ArrowLeft size={18} />
                                Continue Shopping
                            </motion.span>
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;