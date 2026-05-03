import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronDown, Grid3X3, Sparkles, ArrowRight, Flame, Star, 
    TrendingUp, Zap, X, Tag, Package, Timer, Gift, ShoppingBag,
    Truck, Sun, Headphones, Watch, Footprints
} from "lucide-react";
import { useCategoryStore } from "../stores/useCategoryStore";
import useImagePreloader from "../hooks/useImagePreloader";

const MegaMenu = () => {
    const { categories } = useCategoryStore();
    const [activeCategory, setActiveCategory] = useState(null);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showHotDeals, setShowHotDeals] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const navRef = useRef(null);
    const itemRefs = useRef({});
    const hotDealsRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Subcategory images preload
    const allSubcategoryImages = useMemo(() => {
        const images = [];
        categories?.forEach((cat) => {
            cat.subcategories?.forEach((sub) => {
                images.push(`/image/subcategoriesimage/${sub.slug}.jpg`);
            });
        });
        return images;
    }, [categories]);

    const loadedImages = useImagePreloader(allSubcategoryImages);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
                setActiveCategory(null);
                setShowAllCategories(false);
                setShowHotDeals(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        if (activeCategory && itemRefs.current[activeCategory] && navRef.current) {
            const rect = itemRefs.current[activeCategory].getBoundingClientRect();
            const navRect = navRef.current.getBoundingClientRect();
            
            const dropdownWidth = 280;
            const screenWidth = window.innerWidth;
            let leftPos = rect.left;
            
            if (leftPos + dropdownWidth > screenWidth - 20) {
                leftPos = screenWidth - dropdownWidth - 20;
            }
            if (leftPos < 10) leftPos = 10;
            
            setDropdownPosition({
                top: navRect.bottom + 5,
                left: leftPos,
            });
        }
    }, [activeCategory]);

    useEffect(() => {
        if (showHotDeals && hotDealsRef.current && navRef.current) {
            const rect = hotDealsRef.current.getBoundingClientRect();
            const navRect = navRef.current.getBoundingClientRect();
            
            const dropdownWidth = 380;
            const screenWidth = window.innerWidth;
            
            let leftPos = rect.right - dropdownWidth;
            
            if (leftPos < 10) leftPos = 10;
            if (leftPos + dropdownWidth > screenWidth - 10) {
                leftPos = screenWidth - dropdownWidth - 10;
            }
            
            setDropdownPosition({
                top: navRect.bottom + 5,
                left: leftPos,
            });
        }
    }, [showHotDeals]);

    const getCategoryIcon = (slug) => {
        const icons = {
            electronics: <Zap size={16} />,
            fashion: <Sparkles size={16} />,
            'home-living': <Grid3X3 size={16} />,
            beauty: <Star size={16} />,
            sports: <Flame size={16} />,
            books: <TrendingUp size={16} />,
        };
        return icons[slug] || <Grid3X3 size={16} />;
    };

    const getProductCount = (sub) => {
        return sub.productCount ?? sub.itemCount ?? sub.productsCount ?? sub.count ?? 0;
    };

    const getSubcategoryImage = (sub) => {
        return `/image/subcategoriesimage/${sub.slug}.jpg`; 
    };

    const hotDeals = [
        {
            id: 1,
            title: "Summer Sale",
            discount: "50% OFF",
            description: "Up to 50% off on summer collection",
            icon: <Sun size={16} />,
            color: "bg-orange-500",
            link: "/category/fashion",
            endTime: "2 days left"
        },
        {
            id: 2,
            title: "Flash Deal",
            discount: "70% OFF",
            description: "Limited time flash deals",
            icon: <Zap size={16} />,
            color: "bg-purple-500",
            link: "/category/electronics",
            endTime: "5 hours left"
        },
        {
            id: 3,
            title: "New User",
            discount: "10% OFF",
            description: "Extra 10% off for new users",
            icon: <Gift size={16} />,
            color: "bg-green-500",
            link: "/signup",
            endTime: "Always"
        },
        {
            id: 4,
            title: "Free Shipping",
            discount: "FREE",
            description: "Free shipping on orders above $50",
            icon: <Truck size={16} />,
            color: "bg-blue-500",
            link: "/category/home-living",
            endTime: "Limited"
        }
    ];

    const featuredDeals = [
        { 
            name: "Wireless Headphones", 
            price: "$29", 
            originalPrice: "$59", 
            link: "/category/electronics",
            icon: <Headphones size={20} />
        },
        { 
            name: "Smart Watch", 
            price: "$49", 
            originalPrice: "$99", 
            link: "/category/electronics",
            icon: <Watch size={20} />
        },
        { 
            name: "Running Shoes", 
            price: "$39", 
            originalPrice: "$79", 
            link: "/category/fashion",
            icon: <Footprints size={20} />
        },
    ];

    return (
        <>
            {/* MegaMenu - z-[40] taake Navbar ke neeche rahe */}
            <motion.nav 
                ref={navRef}
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ duration: 0.3 }}
                className="sticky top-[72px] z-[40] bg-white/95 backdrop-blur-md border-b border-[#F8BBD9]/30 shadow-sm"
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
                        
                        {/* All Categories Button */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowAllCategories(!showAllCategories);
                                    setShowHotDeals(false);
                                    setActiveCategory(null);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg shrink-0 ${
                                    showAllCategories 
                                        ? 'bg-[#880E4F] text-white' 
                                        : 'bg-[#C2185B] text-white hover:bg-[#880E4F]'
                                }`}
                            >
                                <Grid3X3 size={16} />
                                <span className="hidden sm:inline">All Categories</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showAllCategories ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-[#F8BBD9] mx-2 shrink-0" />

                        {/* Category Links with HOVER dropdown */}
                        {categories && categories.map((category) => (
                            <div
                                key={category.slug}
                                ref={(el) => { itemRefs.current[category.slug] = el; }}
                                className="relative shrink-0"
                                onMouseEnter={() => {
                                    setActiveCategory(category.slug);
                                    setShowHotDeals(false);
                                    setShowAllCategories(false);
                                }}
                                onMouseLeave={() => setActiveCategory(null)}
                            >
                                <Link
                                    to={`/category/${category.slug}`}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all duration-300 mx-0.5
                                        ${activeCategory === category.slug 
                                            ? "text-white bg-[#C2185B] shadow-md" 
                                            : "text-[#880E4F] hover:text-[#C2185B] hover:bg-[#FFF5F7]"
                                        }`}
                                >
                                    <span className={activeCategory === category.slug ? "text-white" : "text-[#E91E63]"}>
                                        {getCategoryIcon(category.slug)}
                                    </span>
                                    <span className="whitespace-nowrap">{category.name}</span>
                                    {(category.productCount > 0 || category.itemCount > 0) && (
                                        <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                            {category.productCount || category.itemCount}
                                        </span>
                                    )}
                                    {category.subcategories?.length > 0 && (
                                        <ChevronDown 
                                            size={14} 
                                            className={`transition-transform duration-200 ${activeCategory === category.slug ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </Link>
                            </div>
                        ))}

                        {/* Hot Deals Button - HOVER se open */}
                        <div 
                            className="ml-auto shrink-0 relative"
                            onMouseEnter={() => {
                                setShowHotDeals(true);
                                setActiveCategory(null);
                                setShowAllCategories(false);
                            }}
                            onMouseLeave={() => setShowHotDeals(false)}
                        >
                            <button
                                ref={hotDealsRef}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all ${
                                    showHotDeals
                                        ? "text-white bg-[#C2185B] shadow-md"
                                        : "text-[#E91E63] hover:text-[#C2185B] hover:bg-[#FFF5F7]"
                                }`}
                            >
                                <Flame size={16} className={showHotDeals ? "text-white" : "text-[#E91E63] animate-pulse"} />
                                <span className="hidden sm:inline">Hot Deals</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showHotDeals ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* HOT DEALS DROPDOWN */}
            <AnimatePresence>
                {showHotDeals && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: "fixed",
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            zIndex: 50,
                        }}
                        className="bg-white rounded-2xl shadow-2xl border border-[#F8BBD9] overflow-hidden w-[380px] max-w-[95vw]"
                        onMouseEnter={() => setShowHotDeals(true)}
                        onMouseLeave={() => setShowHotDeals(false)}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-[#880E4F] to-[#C2185B] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                    <Flame size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Hot Deals</h3>
                                    <p className="text-xs text-[#F8BBD9]">Exclusive offers for you</p>
                                </div>
                            </div>
                            <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold">
                                {hotDeals.length} Active
                            </div>
                        </div>

                        {/* Deals List - CLICKABLE */}
                        <div className="p-4 max-h-[450px] overflow-y-auto">
                            <div className="grid gap-2">
                                {hotDeals.map((deal, index) => (
                                    <motion.div
                                        key={deal.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={deal.link}
                                            onClick={() => setShowHotDeals(false)}
                                            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[#FFF5F7] transition-all border border-transparent hover:border-[#F8BBD9]/50"
                                        >
                                            <div className={`w-12 h-12 rounded-xl ${deal.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                                                {deal.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-[#880E4F] text-sm group-hover:text-[#C2185B] transition-colors">
                                                        {deal.title}
                                                    </span>
                                                    <span className="text-xs font-bold text-white bg-[#C2185B] px-2.5 py-1 rounded-full shadow-sm">
                                                        {deal.discount}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">{deal.description}</p>
                                                <div className="flex items-center gap-1.5 text-[11px] text-[#E91E63] font-medium">
                                                    <Timer size={12} />
                                                    <span>{deal.endTime}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="my-3 border-t border-[#F8BBD9]/40" />

                            {/* Featured Products - CLICKABLE */}
                            <p className="text-xs font-bold text-[#880E4F] mb-3 px-1 uppercase tracking-wider">Featured Deals</p>
                            <div className="grid gap-2">
                                {featuredDeals.map((product, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.05 }}
                                    >
                                        <Link
                                            to={product.link}
                                            onClick={() => setShowHotDeals(false)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF5F7] transition-all group border border-transparent hover:border-[#F8BBD9]/30"
                                        >
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFF5F7] to-[#F8BBD9]/20 border border-[#F8BBD9]/30 flex items-center justify-center text-[#C2185B] group-hover:scale-105 transition-transform">
                                                {product.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#2D2D2D] group-hover:text-[#C2185B] transition-colors truncate">
                                                    {product.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-base font-bold text-[#C2185B]">{product.price}</span>
                                                    <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                                                        Save 50%
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-[#C2185B] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* View All Button */}
                            <Link
                                to="/category/electronics"
                                onClick={() => setShowHotDeals(false)}
                                className="flex items-center justify-center gap-2 mt-4 p-3 bg-gradient-to-r from-[#FFF5F7] to-[#F8BBD9]/10 rounded-xl text-[#C2185B] font-semibold text-sm hover:from-[#F8BBD9]/20 hover:to-[#F8BBD9]/30 transition-all border border-[#F8BBD9]/40 hover:border-[#C2185B]/50 group"
                            >
                                <span>View All Deals</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ALL CATEGORIES MODAL */}
            <AnimatePresence>
                {showAllCategories && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[100px] px-4"
                        onClick={() => setShowAllCategories(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.9 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
                            className="w-full max-w-3xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -inset-1 bg-[#C2185B]/20 rounded-3xl blur-xl" />
                            
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-[#F8BBD9] overflow-hidden max-h-[75vh] flex flex-col">
                                <div className="bg-[#880E4F] px-6 py-4 flex items-center justify-between shrink-0 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2185B]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#E91E63]/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                                    
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                            <Grid3X3 size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">All Categories</h2>
                                            <p className="text-xs text-[#F8BBD9]">{categories?.length || 0} categories available</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAllCategories(false)}
                                        className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors relative z-10"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="p-5 overflow-y-auto bg-[#FFF5F7]/30">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {categories && categories.map((category, index) => (
                                            <motion.div
                                                key={category.slug}
                                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ delay: index * 0.05, type: "spring" }}
                                            >
                                                <Link
                                                    to={`/category/${category.slug}`}
                                                    onClick={() => setShowAllCategories(false)}
                                                    className="group block"
                                                >
                                                    <div className="bg-white rounded-2xl p-4 border-2 border-[#F8BBD9]/40 hover:border-[#C2185B] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                                        <div className="w-10 h-10 bg-[#C2185B] rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                            {getCategoryIcon(category.slug)}
                                                        </div>
                                                        <h3 className="font-bold text-[#880E4F] group-hover:text-[#C2185B] transition-colors text-sm mb-1">
                                                            {category.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Package size={12} />
                                                            <span>{category.subcategories?.length || 0} subcategories</span>
                                                        </div>
                                                        
                                                        {(category.productCount > 0 || category.itemCount > 0) && (
                                                            <div className="absolute top-3 right-3 bg-[#C2185B] text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">
                                                                {category.productCount || category.itemCount} items
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-[#FFF5F7] px-5 py-3 border-t border-[#F8BBD9]/30 text-center">
                                    <p className="text-xs text-[#880E4F]/70">Explore our wide range of categories</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CATEGORY DROPDOWNS - HOVER se open */}
            <AnimatePresence>
                {activeCategory && !showAllCategories && !showHotDeals && (() => {
                    const category = categories?.find(c => c.slug === activeCategory);
                    if (!category?.subcategories?.length) return null;
                    
                    return (
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: "fixed",
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                zIndex: 50,
                            }}
                            className="bg-white rounded-xl shadow-2xl border border-[#F8BBD9] overflow-hidden w-[280px] max-w-[90vw]"
                            onMouseEnter={() => setActiveCategory(activeCategory)}
                            onMouseLeave={() => setActiveCategory(null)}
                        >
                            <div className="px-4 py-2.5 bg-[#FFF5F7] border-b border-[#F8BBD9]/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-[#C2185B] rounded-lg flex items-center justify-center text-white">
                                        {getCategoryIcon(category.slug)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#880E4F] text-sm">{category.name}</h3>
                                        <p className="text-xs text-[#E91E63]">{category.subcategories.length} subcategories</p>
                                    </div>
                                </div>
                                <Link 
                                    to={`/category/${category.slug}`}
                                    className="text-xs text-[#C2185B] hover:text-[#880E4F] font-medium flex items-center gap-1 transition-colors"
                                >
                                    View All <ArrowRight size={12} />
                                </Link>
                            </div>

                            <div className="p-2 max-h-[280px] overflow-y-auto">
                                <div className="flex flex-col gap-0.5">
                                    {category.subcategories.map((sub, index) => {
                                        const imgUrl = getSubcategoryImage(sub);
                                        const isLoaded = loadedImages[imgUrl];
                                        
                                        return (
                                            <motion.div
                                                key={sub.slug}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <Link
                                                    to={`/category/${category.slug}/${sub.slug}`}
                                                    className="group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FFF5F7] transition-all duration-200"
                                                >
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform overflow-hidden bg-[#C2185B] border border-[#F8BBD9]/30 relative">
                                                        {!isLoaded && (
                                                            <div className="absolute inset-0 bg-[#C2185B] animate-pulse" />
                                                        )}
                                                        
                                                        <img 
                                                            src={imgUrl} 
                                                            alt={sub.name}
                                                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                                                                isLoaded ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[#2D2D2D] group-hover:text-[#C2185B] font-medium text-sm transition-colors block truncate">
                                                            {sub.name}
                                                        </span>
                                                    </div>
                                                    
                                                    {(() => {
                                                        const count = getProductCount(sub);
                                                        return count > 0 ? (
                                                            <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-[#FFF5F7] text-[#C2185B] font-semibold border border-[#F8BBD9]/50">
                                                                {count}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0 bg-gray-100 text-gray-400 font-medium">
                                                                New
                                                            </span>
                                                        );
                                                    })()}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-3 pb-3">
                                <div className="bg-[#FFF5F7] rounded-lg p-2.5 flex items-center gap-2.5 border border-[#F8BBD9]/30">
                                    <div className="w-7 h-7 bg-[#C2185B] rounded-full flex items-center justify-center text-white shrink-0">
                                        <Tag size={12} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[#880E4F] truncate">Explore {category.name}</p>
                                        <p className="text-xs text-[#E91E63] truncate">Discover amazing deals!</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </>
    );
};

export default MegaMenu;