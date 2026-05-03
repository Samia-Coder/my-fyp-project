import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";  // ✅ AnimatePresence add kiya
import { Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const PeopleAlsoBought = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecommendations = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await axios.get("/products/recommendations");
            setRecommendations(res.data);
        } catch (error) {
            try {
                const fallback = await axios.get("/products");
                const shuffled = fallback.data.products.sort(() => 0.5 - Math.random()).slice(0, 4);
                setRecommendations(shuffled);
            } catch {
                toast.error("Failed to load recommendations");
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    if (isLoading) {
        return (
            <motion.div 
                className="mt-12 bg-white rounded-3xl p-8 border border-[#F8BBD9]/30 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles size={20} className="text-[#C2185B]" />
                    <h3 className='text-xl font-bold text-[#880E4F]'>People Also Bought</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-[#FFF5F7] rounded-2xl h-64 animate-pulse" />
                    ))}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className='mt-12 bg-white rounded-3xl p-8 border border-[#F8BBD9]/30 shadow-xl shadow-[#F8BBD9]/10'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-xl shadow-md">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className='text-xl md:text-2xl font-black text-[#880E4F]'>
                            People Also Bought
                        </h3>
                        <p className="text-sm text-gray-500">Recommended based on your cart items</p>
                    </div>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchRecommendations(true)}
                    disabled={refreshing}
                    className="p-2.5 bg-[#FFF5F7] rounded-xl text-[#C2185B] hover:bg-[#F8BBD9]/30 transition-colors border border-[#F8BBD9]/30"
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                </motion.button>
            </div>

            {/* Products Grid */}
            <motion.div 
                className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <AnimatePresence>  {/* ✅ Ab properly import hai */}
                    {recommendations.map((product) => (
                        <motion.div 
                            key={product._id} 
                            variants={itemVariants} 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* View More */}
            <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-[#FFF5F7] to-[#FCE4EC] text-[#C2185B] font-bold rounded-2xl border-2 border-[#F8BBD9] hover:border-[#C2185B] transition-colors"
                >
                    View More Recommendations
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default PeopleAlsoBought;