import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Star, ChevronLeft, Minus, Plus, Sparkles, Check, Zap, Award, BadgeCheck, Info, X } from "lucide-react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import SmartFitAdvisor from "../components/SmartFitAdvisor";

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const { addToCart } = useCartStore();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlistStore();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showFitAdvisor, setShowFitAdvisor] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [addedToCart, setAddedToCart] = useState(false);
    const [hoveredImage, setHoveredImage] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/products/get/${id}`);
            setProduct(res.data);
            const relatedRes = await axios.get(`/products/category/${res.data.category.main}`);
            setRelatedProducts(relatedRes.data.products.filter(p => p._id !== id).slice(0, 4));
        } catch (error) {
            toast.error("Product not found");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            toast.error("Please login to add to cart");
            return;
        }
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        toast.success(`${quantity} item(s) added to cart!`);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const handleWishlistToggle = () => {
        if (!user) {
            toast.error("Please login to add to wishlist");
            return;
        }
        toggleWishlist(product);
    };

    // Stagger animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F5]">
                <motion.div 
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-24 h-24 border-4 border-[#F8BBD9]/30 rounded-full" />
                    <div className="w-24 h-24 border-4 border-[#C2185B] border-t-transparent border-r-transparent animate-spin rounded-full absolute left-0 top-0" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={28} className="text-[#C2185B]" />
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!product) return null;

    const isWishlisted = isInWishlist(product._id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F5] text-[#2D2D2D] pt-4 pb-12">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Breadcrumb */}
                <motion.nav 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-gray-500 mb-8 py-4 bg-white/60 backdrop-blur-sm rounded-2xl px-6 border border-[#F8BBD9]/20 shadow-sm"
                >
                    <Link to="/" className="hover:text-[#C2185B] transition-colors flex items-center gap-1">
                        Home
                    </Link>
                    <ChevronLeft size={14} className="rotate-180 text-[#F8BBD9]" />
                    <Link to={`/category/${product.category.main}`} className="hover:text-[#C2185B] transition-colors capitalize">
                        {product.category.main}
                    </Link>
                    <ChevronLeft size={14} className="rotate-180 text-[#F8BBD9]" />
                    <span className="text-[#C2185B] font-semibold truncate max-w-[200px]">{product.name}</span>
                </motion.nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                    
                    {/* LEFT: Images Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-5"
                    >
                        {/* Main Image */}
                        <motion.div 
                            className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border border-[#F8BBD9]/30 group cursor-zoom-in"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onMouseEnter={() => setHoveredImage(true)}
                            onMouseLeave={() => { setHoveredImage(false); setIsZoomed(false); }}
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <motion.img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700"
                                animate={{ 
                                    scale: hoveredImage ? (isZoomed ? 1.5 : 1.08) : 1,
                                    rotate: hoveredImage ? (isZoomed ? 2 : 0) : 0
                                }}
                            />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Discount Badge */}
                            <AnimatePresence>
                                {product.discount && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="absolute top-5 left-5 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#C2185B]/30"
                                    >
                                        <span className="flex items-center gap-1">
                                            <Zap size={14} fill="currentColor" />
                                            -{product.discount}% OFF
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Zoom Indicator */}
                            <motion.div 
                                className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredImage ? 1 : 0 }}
                            >
                                <Info size={18} className="text-[#C2185B]" />
                            </motion.div>

                            {/* Wishlist Quick Action */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }}
                                className={`absolute top-5 right-5 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
                                    isWishlisted 
                                        ? 'bg-red-500 text-white shadow-red-500/40' 
                                        : 'bg-white/90 text-gray-400 hover:text-red-500'
                                }`}
                            >
                                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                            </motion.button>
                        </motion.div>
                        
                        {/* Thumbnail Gallery */}
                        {product.images?.length > 1 && (
                            <motion.div 
                                className="flex gap-3 overflow-x-auto pb-2 px-1"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {product.images.map((img, idx) => (
                                    <motion.button
                                        key={idx}
                                        variants={itemVariants}
                                        onClick={() => setSelectedImage(idx)}
                                        whileHover={{ scale: 1.08, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 shadow-md ${
                                            selectedImage === idx 
                                                ? 'border-[#C2185B] shadow-[#C2185B]/30 shadow-lg ring-2 ring-[#C2185B]/20' 
                                                : 'border-[#F8BBD9]/50 hover:border-[#C2185B]/50 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* RIGHT: Product Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Header Section */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <motion.div 
                                    className="flex items-center gap-2 flex-wrap"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-[#FFF5F7] to-[#FCE4EC] text-[#C2185B] text-xs font-bold rounded-full border border-[#F8BBD9] shadow-sm">
                                        {product.category.sub}
                                    </span>
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm flex items-center gap-1">
                                        <BadgeCheck size={12} />
                                        In Stock
                                    </span>
                                    {product.stock < 10 && product.stock > 0 && (
                                        <span className="px-4 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 text-xs font-bold rounded-full border border-orange-200 shadow-sm animate-pulse">
                                            Only {product.stock} left!
                                        </span>
                                    )}
                                </motion.div>
                                
                                <motion.h1 
                                    className="text-3xl md:text-5xl font-bold text-[#880E4F] leading-tight"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {product.name}
                                </motion.h1>
                                
                                <motion.div 
                                    className="flex items-center gap-3 text-sm text-gray-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <span className="capitalize font-medium bg-gray-100 px-3 py-1 rounded-full">{product.category.main}</span>
                                    <span className="text-[#F8BBD9]">•</span>
                                    <span className="font-mono text-xs bg-gray-50 px-3 py-1 rounded-full border border-gray-200">SKU: {product._id?.slice(-6).toUpperCase()}</span>
                                </motion.div>
                            </div>
                            
                            {/* Share Button */}
                            <motion.button 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                                className="p-3 rounded-2xl bg-white text-gray-400 hover:text-[#C2185B] border border-[#F8BBD9]/50 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Share2 size={20} />
                            </motion.button>
                        </div>

                        {/* Rating Section */}
                        <motion.div 
                            className="flex items-center gap-4 bg-gradient-to-r from-[#FFF5F7] to-white p-4 rounded-2xl border border-[#F8BBD9]/30"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#F8BBD9]/20">
                                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-[#880E4F] font-bold text-lg">
                                    {product.ratings?.average || "4.5"}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.div
                                            key={star}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + star * 0.05 }}
                                        >
                                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                        </motion.div>
                                    ))}
                                </div>
                                <span className="text-gray-500 text-sm">
                                    Based on <span className="font-semibold text-[#C2185B]">{product.ratings?.count || "128"}</span> Reviews
                                </span>
                            </div>
                        </motion.div>

                        {/* Price Card */}
                        <motion.div 
                            className="bg-white rounded-3xl p-7 border border-[#F8BBD9]/30 shadow-xl shadow-[#F8BBD9]/10 relative overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {/* Decorative background element */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-[#F8BBD9]/20 to-transparent rounded-full blur-2xl" />
                            
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-4 mb-3">
                                    <motion.span 
                                        className="text-5xl font-black text-[#C2185B] tracking-tight"
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                                    >
                                        ${product.price}
                                    </motion.span>
                                    {product.originalPrice && (
                                        <span className="text-2xl text-gray-400 line-through font-medium">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                    {product.originalPrice && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                                            Save ${(product.originalPrice - product.price).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 text-sm">
                                    <span className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                                        <Truck size={18} />
                                        Free Shipping
                                    </span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-600 font-medium flex items-center gap-1">
                                        <Zap size={16} className="text-[#C2185B]" />
                                        Delivery in 2-3 days
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Wishlist Button - NEW */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleWishlistToggle}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isWishlisted
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30'
                                    : 'bg-white text-[#C2185B] border-2 border-[#F8BBD9] hover:bg-[#FFF5F7]'
                            }`}
                        >
                            <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
                            {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        </motion.button>

                        {/* 🌟🌟🌟 FIND MY PERFECT FIT - SUPER ATTRACTIVE BUTTON 🌟🌟🌟 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <motion.button
                                whileHover={{ 
                                    scale: 1.02,
                                    boxShadow: "0 20px 40px rgba(194, 24, 91, 0.3)"
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFitAdvisor(true)}
                                className="w-full relative overflow-hidden group"
                            >
                                {/* Animated gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#880E4F] via-[#C2185B] to-[#E91E63] animate-gradient-x" />
                                
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                
                                {/* Floating particles effect (CSS) */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute w-2 h-2 bg-white/30 rounded-full top-4 left-10 animate-bounce" style={{ animationDuration: '2s' }} />
                                    <div className="absolute w-1.5 h-1.5 bg-white/20 rounded-full top-8 right-16 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                                    <div className="absolute w-1 h-1 bg-white/25 rounded-full bottom-6 left-20 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                                </div>
                                
                                {/* Main content */}
                                <div className="relative z-10 py-5 px-6 rounded-2xl flex items-center justify-center gap-3 border-2 border-white/20">
                                    <motion.div
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Sparkles size={24} className="text-yellow-300" />
                                    </motion.div>
                                    
                                    <span className="text-white font-bold text-lg tracking-wide">
                                        Find My Perfect Fit
                                    </span>
                                    
                                    <motion.span 
                                        className="text-xs bg-white text-[#C2185B] px-3 py-1 rounded-full font-black tracking-wider uppercase shadow-lg"
                                        animate={{ 
                                            boxShadow: ["0 0 0 0 rgba(255,255,255,0.4)", "0 0 0 10px rgba(255,255,255,0)"]
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        AI Powered
                                    </motion.span>
                                    
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ChevronLeft size={20} className="rotate-180 text-white/80" />
                                    </motion.div>
                                </div>
                            </motion.button>
                            
                            {/* Subtext */}
                            <p className="text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                                <Info size={12} />
                                Get personalized size recommendations using our AI technology
                            </p>
                        </motion.div>

                        {/* Quantity & Actions */}
                        <motion.div 
                            className="space-y-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-5">
                                <span className="text-gray-700 font-bold text-sm uppercase tracking-wider">Quantity:</span>
                                <div className="flex items-center gap-1 bg-white rounded-2xl border-2 border-[#F8BBD9]/50 p-1.5 shadow-lg">
                                    <motion.button 
                                        whileHover={{ scale: 1.1, backgroundColor: "#FFF5F7" }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 rounded-xl transition text-[#C2185B] hover:bg-[#FFF5F7]"
                                    >
                                        <Minus size={18} strokeWidth={3} />
                                    </motion.button>
                                    <span className="w-14 text-center font-black text-xl text-[#880E4F]">{quantity}</span>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, backgroundColor: "#FFF5F7" }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 rounded-xl transition text-[#C2185B] hover:bg-[#FFF5F7]"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </motion.button>
                                </div>
                                {product.stock > 0 ? (
                                    <motion.span 
                                        className="text-green-600 text-sm font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {product.stock} available
                                    </motion.span>
                                ) : (
                                    <span className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-full border border-red-200">Out of Stock</span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
                                        addedToCart 
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30' 
                                            : 'bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:from-[#880E4F] hover:to-[#C2185B] text-white shadow-[#C2185B]/30'
                                    } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-lg`}
                                >
                                    <AnimatePresence mode="wait">
                                        {addedToCart ? (
                                            <motion.span
                                                key="added"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Check size={24} strokeWidth={3} />
                                                Added to Cart!
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="add"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <ShoppingCart size={24} />
                                                Add to Cart
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { handleAddToCart(); navigate("/cart"); }}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-white text-[#C2185B] py-4 rounded-2xl font-bold border-2 border-[#C2185B] hover:bg-gradient-to-r hover:from-[#FFF5F7] hover:to-[#FCE4EC] transition-all disabled:opacity-50 text-lg shadow-lg hover:shadow-xl"
                                >
                                    Buy Now
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div 
                            className="grid grid-cols-3 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {[
                                { icon: Truck, title: "Free Delivery", color: "text-blue-500", bg: "from-blue-50 to-blue-100/50", border: "border-blue-200" },
                                { icon: Shield, title: "Secure Payment", color: "text-green-500", bg: "from-green-50 to-green-100/50", border: "border-green-200" },
                                { icon: RotateCcw, title: "7 Day Return", color: "text-orange-500", bg: "from-orange-50 to-orange-100/50", border: "border-orange-200" },
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className={`flex flex-col items-center gap-3 text-center p-5 bg-gradient-to-b ${item.bg} rounded-2xl border ${item.border} shadow-sm hover:shadow-md transition-shadow`}
                                >
                                    <div className={`p-3 bg-white rounded-full shadow-sm ${item.color}`}>
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-sm text-gray-700 font-bold">{item.title}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Tabs Section */}
                <motion.div 
    className="mt-20"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}      
    transition={{ duration: 0.6, delay: 0.3 }}
>
                    <div className="flex gap-2 bg-white rounded-2xl p-2 border border-[#F8BBD9]/30 w-fit mb-8 shadow-lg">
                        {[
                            { id: "description", label: "Description", icon: Info },
                            { id: "reviews", label: "Reviews", icon: Star },
                            { id: "shipping", label: "Shipping", icon: Truck }
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all flex items-center gap-2 ${
                                    activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-[#C2185B] to-[#880E4F] text-white shadow-lg shadow-[#C2185B]/25' 
                                        : 'text-gray-500 hover:text-[#C2185B] hover:bg-[#FFF5F7]'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "description" && (
                            <motion.div
                                key="description"
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl p-10 border border-[#F8BBD9]/30 shadow-xl"
                            >
                                <h3 className="text-2xl font-bold text-[#880E4F] mb-6 flex items-center gap-2">
                                    <Award size={28} className="text-[#C2185B]" />
                                    Product Description
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
                            </motion.div>
                        )}
                        {activeTab === "reviews" && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl p-10 border border-[#F8BBD9]/30 shadow-xl"
                            >
                                <h3 className="text-2xl font-bold text-[#880E4F] mb-8 flex items-center gap-2">
                                    <Star size={28} className="text-yellow-500 fill-yellow-500" />
                                    Customer Reviews
                                </h3>
                                <div className="space-y-8">
                                   {[1, 2, 3].map((review, idx) => (
    <motion.div 
        key={review} 
        className="border-b border-[#F8BBD9]/30 pb-8 last:border-0"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}       
        transition={{ delay: idx * 0.1 }}
    >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#C2185B] to-[#880E4F] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    U{review}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#880E4F] text-lg">User {review}</p>
                                                    <div className="flex gap-0.5 mt-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="ml-auto text-sm text-gray-400">2 days ago</span>
                                            </div>
                                            <p className="text-gray-600 text-lg leading-relaxed">Great product! Exactly as described. Fast delivery and good quality. Would definitely recommend to everyone!</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "shipping" && (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl p-10 border border-[#F8BBD9]/30 shadow-xl"
                            >
                                <h3 className="text-2xl font-bold text-[#880E4F] mb-6 flex items-center gap-2">
                                    <Truck size={28} className="text-[#C2185B]" />
                                    Shipping Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { icon: "🚚", title: "Standard Delivery", desc: "3-5 business days", color: "from-blue-50 to-blue-100/50", border: "border-blue-200" },
                                        { icon: "⚡", title: "Express Delivery", desc: "1-2 business days", color: "from-yellow-50 to-yellow-100/50", border: "border-yellow-200" },
                                        { icon: "📦", title: "Free Shipping", desc: "On orders over $50", color: "from-green-50 to-green-100/50", border: "border-green-200" },
                                        { icon: "🌍", title: "International", desc: "7-14 business days", color: "from-purple-50 to-purple-100/50", border: "border-purple-200" },
                                    ].map((item, idx) => (
                                        <motion.div 
                                            key={idx}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            className={`p-6 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} shadow-sm`}
                                        >
                                            <span className="text-3xl mb-2 block">{item.icon}</span>
                                            <p className="font-bold text-gray-800 text-lg">{item.title}</p>
                                            <p className="text-gray-600">{item.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Related Products */}
                <AnimatePresence>
    {relatedProducts.length > 0 && (
        <motion.div 
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}       
            transition={{ duration: 0.6, delay: 0.5 }}
        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#880E4F] flex items-center gap-2">
                                        <Sparkles size={28} className="text-[#C2185B]" />
                                        Related Products
                                    </h2>
                                    <p className="text-gray-500 mt-1">You might also love these</p>
                                </div>
                                <motion.div whileHover={{ x: 5 }}>
                                    <Link to={`/category/${product.category.main}`} className="text-[#C2185B] hover:text-[#880E4F] font-bold flex items-center gap-1 bg-white px-5 py-2.5 rounded-full border border-[#F8BBD9] shadow-sm hover:shadow-md transition-all">
                                        View All <ChevronLeft size={18} className="rotate-180" />
                                    </Link>
                                </motion.div>
                            </div>
                           <motion.div 
    className="grid grid-cols-2 md:grid-cols-4 gap-6"
    variants={containerVariants}
    initial="hidden"
    animate="visible"              // ← animate
>
                                {relatedProducts.map((p, idx) => (
                                    <motion.div key={p._id} variants={itemVariants}>
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Smart Fit Advisor Modal */}
            <AnimatePresence>
                {showFitAdvisor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowFitAdvisor(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] p-6 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={24} className="text-yellow-300" />
                                    <h3 className="text-xl font-bold">AI Fit Advisor</h3>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowFitAdvisor(false)}
                                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="p-6">
                                <SmartFitAdvisor 
                                    isOpen={showFitAdvisor} 
                                    onClose={() => setShowFitAdvisor(false)} 
                                    product={product}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetailPage;