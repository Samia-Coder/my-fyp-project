import { motion, AnimatePresence } from "framer-motion";
import { Trash, Star, Package, Plus, Sparkles, Tag, ArrowUpRight } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { Link } from "react-router-dom";
import { useState } from "react";

// ============================================
// PARTICLE BACKGROUND COMPONENT
// ============================================

const ParticleBackground = () => {
    const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-[#E91E63]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        filter: 'blur(1px)',
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E91E63] rounded-full filter blur-[150px] opacity-[0.03]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C2185B] rounded-full filter blur-[150px] opacity-[0.03]" />
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ProductsList = () => {
    const { deleteProduct, toggleFeaturedProduct, products, loading } = useProductStore();
    const [deletingId, setDeletingId] = useState(null);
    const [featuredAnimId, setFeaturedAnimId] = useState(null);

    // Handle delete with animation
    const handleDelete = async (id) => {
        setDeletingId(id);
        setTimeout(() => {
            deleteProduct(id);
            setDeletingId(null);
        }, 300);
    };

    // Handle featured toggle with animation
    const handleToggleFeatured = (id) => {
        setFeaturedAnimId(id);
        toggleFeaturedProduct(id);
        setTimeout(() => setFeaturedAnimId(null), 500);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center relative overflow-hidden">
                <ParticleBackground />
                <motion.div 
                    className="relative z-10 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-24 h-24 relative"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="absolute inset-0 rounded-full border-4 border-[#F8BBD9]" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-[#C2185B] border-r-transparent border-b-transparent border-l-transparent" />
                    </motion.div>
                    <motion.div
                        className="mt-8 flex items-center gap-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Sparkles className="w-5 h-5 text-[#C2185B]" />
                        <span className="text-[#C2185B] font-semibold text-lg tracking-wide">Loading Products...</span>
                        <Sparkles className="w-5 h-5 text-[#C2185B]" />
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Empty state
    if (!products || products.length === 0) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center relative overflow-hidden px-4">
                <ParticleBackground />
                <motion.div
                    className="relative z-10 text-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#F8BBD9]/30 p-12 max-w-md w-full"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                >
                    <motion.div 
                        className="w-24 h-24 bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] rounded-full flex items-center justify-center mx-auto mb-6"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Package size={48} className="text-[#C2185B]" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-[#880E4F] mb-3">No Products Found</h3>
                    <p className="text-[#C2185B] opacity-60 mb-6 font-medium">Create your first product to see it here!</p>
                    <Link to="/add-product">
                        <motion.button
                            className="bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#C2185B]/30 flex items-center gap-2 mx-auto"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus size={20} />
                            Add Product
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7] relative overflow-hidden">
            <ParticleBackground />
            
            <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
                {/* HEADER */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <motion.div 
                                className="p-3 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-2xl shadow-lg shadow-[#C2185B]/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Package className="w-8 h-8 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-4xl font-black text-[#880E4F] tracking-tight">
                                    Products List
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <p className="text-[#C2185B] opacity-60 font-medium">
                                        {products.length} products in inventory
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <Link to="/createproductform">
                            <motion.button
                                className="bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#C2185B]/30 flex items-center gap-2"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Plus size={20} />
                                Add Product
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Products Table */}
                <motion.div
                    className="bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-[#F8BBD9]/40"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#F8BBD9]/20">
                            <thead className="bg-gradient-to-r from-[#FFF5F7] to-[#FCE4EC]">
                                <tr>
                                    {['Product', 'Price', 'Category', 'Featured', 'Actions'].map((header, idx) => (
                                        <motion.th
                                            key={header}
                                            scope="col"
                                            className="px-6 py-5 text-left text-xs font-black text-[#880E4F] uppercase tracking-wider"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + idx * 0.05 }}
                                        >
                                            {header}
                                        </motion.th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-[#F8BBD9]/15">
                                <AnimatePresence mode="popLayout">
                                    {products.map((product, index) => (
                                        <motion.tr
                                            key={product._id}
                                            layout
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ 
                                                opacity: deletingId === product._id ? 0 : 1, 
                                                x: 0,
                                                scale: deletingId === product._id ? 0.9 : 1
                                            }}
                                            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                                            transition={{ duration: 0.4, delay: index * 0.05, type: "spring" }}
                                        >
                                            {/* Product Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            className="h-14 w-14 rounded-xl object-cover border-2 border-[#F8BBD9] shadow-md"
                                                            src={product.image}
                                                            alt={product.name}
                                                        />
                                                        {product.isFeatured && (
                                                            <motion.div 
                                                                className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-1 shadow-lg"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 500 }}
                                                            >
                                                                <Sparkles className="w-3 h-3 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[#2D2D2D]">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5 font-medium">ID: {product._id?.slice(-6)}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Price Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-lg font-black text-[#C2185B]">
                                                    ${product.price?.toFixed(2)}
                                                </div>
                                            </td>

                                            {/* Category Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD9]/50">
                                                    <Tag size={12} className="mr-1.5" />
                                                    {product.category?.main || product.category?.sub || product.category || "N/A"}
                                                </span>
                                            </td>

                                            {/* Featured Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <motion.button
                                                    onClick={() => handleToggleFeatured(product._id)}
                                                    className={`relative p-3 rounded-xl transition-all duration-300 ${
                                                        product.isFeatured
                                                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-400/30"
                                                            : "bg-[#FFF5F7] text-gray-300 hover:bg-[#F8BBD9] hover:text-[#C2185B]"
                                                    }`}
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <motion.div
                                                        animate={featuredAnimId === product._id ? { rotate: 360, scale: [1, 1.4, 1] } : {}}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <Star className={`h-5 w-5 ${product.isFeatured ? "fill-white" : ""}`} />
                                                    </motion.div>
                                                    {product.isFeatured && (
                                                        <motion.span
                                                            className="absolute -top-1 -right-1 flex h-3 w-3"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                                                        </motion.span>
                                                    )}
                                                </motion.button>
                                            </td>

                                            {/* Actions Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <motion.button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-3 rounded-xl bg-red-50 text-red-400 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-500/30"
                                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Trash className="h-5 w-5" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <motion.div 
                        className="px-6 py-4 bg-gradient-to-r from-[#FFF5F7] to-[#FCE4EC] border-t border-[#F8BBD9]/20 flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <p className="text-sm text-[#C2185B] font-medium opacity-60">
                            Showing {products.length} products
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[#C2185B] opacity-60 font-medium">
                            <ArrowUpRight size={16} />
                            Scroll to view all
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductsList;