import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Heart, Package } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CartItem = ({ item }) => {
    const { removeFromCart, updateQuantity } = useCartStore();
    const { addToWishlist } = useWishlistStore();

    const handleMoveToWishlist = () => {
        addToWishlist(item);
        removeFromCart(item._id);
        toast.success("Moved to wishlist!");
    };

    // Safety check
    if (!item) {
        return (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-600">
                Error: Item data missing
            </div>
        );
    }

    return (
        <motion.div
            layout
            className="bg-white rounded-2xl p-5 border border-[#F8BBD9]/30 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            {/* Decorative corner */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-[#F8BBD9]/10 to-transparent rounded-full blur-xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
                {/* Product Image */}
                <Link to={`/product/${item._id}`} className="shrink-0">
                    <motion.div 
                        className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-[#FFF5F7] to-[#FCE4EC] rounded-2xl overflow-hidden border-2 border-[#F8BBD9]/30 group-hover:border-[#C2185B]/50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        {item.image ? (
                            <img 
                                className="w-full h-full object-cover" 
                                src={item.image} 
                                alt={item.name}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package size={40} className="text-[#F8BBD9]" />
                            </div>
                        )}
                    </motion.div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0 space-y-2">
                    <Link to={`/product/${item._id}`}>
                        <h3 className="text-lg font-bold text-[#880E4F] hover:text-[#C2185B] transition-colors truncate">
                            {item.name || "Product"}
                        </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 line-clamp-2">
                        {item.description || item.category?.sub || "Premium quality product"}
                    </p>

                    {/* Category Tag */}
                    {item.category && (
                        <span className="inline-block px-3 py-1 bg-[#FFF5F7] text-[#C2185B] text-xs font-medium rounded-full border border-[#F8BBD9]">
                            {item.category.main}
                        </span>
                    )}

                    {/* Price - Mobile Only */}
                    <div className="md:hidden">
                        <span className="text-2xl font-black text-[#C2185B]">
                            ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                            <span className="text-sm text-gray-400 ml-2">
                                (${item.price} each)
                            </span>
                        )}
                    </div>
                </div>

                {/* Quantity & Price Section */}
                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-[#FFF5F7] rounded-xl border-2 border-[#F8BBD9]/50 p-1">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 hover:bg-white rounded-lg transition text-[#C2185B] disabled:opacity-50"
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={16} strokeWidth={3} />
                        </motion.button>
                        
                        <span className="w-10 text-center font-black text-lg text-[#880E4F]">
                            {item.quantity}
                        </span>
                        
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 hover:bg-white rounded-lg transition text-[#C2185B]"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                            <Plus size={16} strokeWidth={3} />
                        </motion.button>
                    </div>

                    {/* Price - Desktop */}
                    <div className="hidden md:block text-right min-w-[100px]">
                        <p className="text-2xl font-black text-[#C2185B]">
                            ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">
                                ${item.price} each
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {/* Move to Wishlist */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleMoveToWishlist}
                            className="p-2.5 bg-[#FFF5F7] text-[#C2185B] rounded-xl hover:bg-[#F8BBD9]/30 transition-colors border border-[#F8BBD9]/30"
                            title="Move to Wishlist"
                        >
                            <Heart size={18} />
                        </motion.button>
                        
                        {/* Remove */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item._id)}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                            title="Remove from Cart"
                        >
                            <Trash2 size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CartItem;