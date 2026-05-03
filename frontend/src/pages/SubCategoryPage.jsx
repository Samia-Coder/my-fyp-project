import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, Home, Grid3X3, LayoutList, 
  SlidersHorizontal, X, Heart, ShoppingCart, 
  Eye, Star, Package, ArrowUpDown, Sparkles,
  Tag, TrendingUp, Filter
} from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100">
    <div className="aspect-square bg-gray-200 rounded-xl animate-pulse mb-4" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
      <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8" />
    </div>
  </div>
);

const SubCategoryPage = () => {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams();
  const navigate = useNavigate();
  const { currentCategory, fetchCategoryBySlug } = useCategoryStore();
  const { products, fetchProductsByCategory, loading } = useProductStore();

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    fetchCategoryBySlug(categorySlug);
    fetchProductsByCategory(categorySlug, subcategorySlug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categorySlug, subcategorySlug, fetchCategoryBySlug, fetchProductsByCategory]);

  const subcategoryData = currentCategory?.subcategories?.find((sub) => sub.slug === subcategorySlug);
  const subcategoryName = subcategoryData?.name || subcategorySlug;
  const subcategoryImage = subcategoryData?.image || currentCategory?.image || "/images/banner.jpg";

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addToCart = (product) => {
    console.log("Added to cart:", product);
  };

  const sortOptions = [
    { value: "featured", label: "Featured", icon: Sparkles },
    { value: "price-low", label: "Price: Low to High", icon: TrendingUp },
    { value: "price-high", label: "Price: High to Low", icon: TrendingUp },
    { value: "newest", label: "Newest First", icon: Package },
    { value: "rating", label: "Top Rated", icon: Star },
    { value: "name", label: "Name A-Z", icon: ArrowUpDown },
  ];

  const filteredProducts = products ? [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
      case "price-high": return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
      case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "name": return a.name?.localeCompare(b.name);
      default: return 0;
    }
  }).filter(p => {
    const price = p.discountedPrice || p.price;
    return price >= priceRange[0] && price <= priceRange[1];
  }).filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  if (loading) return <LoadingSpinner />;

  // ✅ DEBUG LOGS
  console.log("=== SUBCATEGORY DEBUG ===");
  console.log("currentCategory:", currentCategory);
  console.log("subcategories:", currentCategory?.subcategories);
  console.log("subcategories map:", currentCategory?.subcategories?.map(s => ({slug: s.slug, name: s.name, image: s.image})));

  return (
    <div className="min-h-screen bg-[#FFF5F7] relative overflow-hidden">
      {/* Floating Decoration */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-[#C2185B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-[#F8BBD9]/20 rounded-full blur-3xl pointer-events-none" />

      {/* ===== HERO SECTION ===== */}
      <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
        
        {/* Background Image */}
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={subcategoryImage} 
            alt={subcategoryName} 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-[#880E4F]/80 mix-blend-multiply z-[1]" />
        <div className="absolute inset-0 bg-black/30 z-[1]" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{ left: `${15 + i * 15}%`, bottom: "10%" }}
            />
          ))}
        </div>

        {/* ===== HERO CONTENT ===== */}
        <div className="absolute inset-0 flex items-center justify-center z-[5] pb-12 sm:pb-16 md:pb-20">
          <div className="container mx-auto px-4 text-center relative">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              
              {/* Breadcrumb */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 text-white/70 text-xs sm:text-sm mb-3 md:mb-4"
              >
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  <Home size={14} /> Home
                </Link>
                <ChevronRight size={14} />
                <Link to={`/category/${categorySlug}`} className="hover:text-white transition-colors capitalize">
                  {currentCategory?.name || categorySlug}
                </Link>
                <ChevronRight size={14} />
                <span className="text-white font-medium capitalize">{subcategoryName}</span>
              </motion.div>

              {/* Icon */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 border border-white/20"
              >
                <Tag size={24} className="text-white sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </motion.div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 tracking-tight capitalize">
                {subcategoryName}
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed px-4">
                Discover our premium collection of {subcategoryName.toLowerCase()} curated just for you.
              </p>

              {/* ===== STATS ===== */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 sm:gap-6 md:gap-10"
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-white">{products?.length || 0}</span>
                  <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Products</span>
                </div>
                <div className="w-px h-8 sm:h-10 bg-white/20" />
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-white">4.8</span>
                  <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Rating</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ===== WAVE ===== */}
        <div className="absolute bottom-0 left-0 right-0 leading-none z-[10]">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="#FFF5F7"
            />
          </svg>
        </div>
      </div>

      {/* ===== SUBCATEGORY TABS - FIXED ===== */}
      {currentCategory?.subcategories?.length > 0 && (
  <div className="container mx-auto px-4 -mt-6 relative z-20">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border border-[#F8BBD9]/30 p-4 overflow-x-auto"
    >
      <div className="flex gap-3 min-w-max">
        {currentCategory.subcategories.map((sub) => (
          <motion.button
            key={sub.slug}
            onClick={() => navigate(`/category/${categorySlug}/${sub.slug}`)}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all min-w-[100px] ${
              sub.slug === subcategorySlug
                ? "bg-gradient-to-br from-[#C2185B] to-[#E91E63] text-white shadow-lg shadow-[#C2185B]/30"
                : "bg-[#FFF5F7] text-[#880E4F] hover:bg-[#F8BBD9]/30"
            }`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* ✅ FIXED IMAGE - Use database image OR fallback to local */}
            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 relative ${
              sub.slug === subcategorySlug 
                ? "border-white/50" 
                : "border-[#F8BBD9]"
            }`}>
              <img 
                // Priority 1: Database se aayi image
                // Priority 2: Local slug-based image
                src={sub.image || `/image/subcategoriesimage/${sub.slug}.jpg`}
                alt={sub.name}
                className="w-full h-full object-cover absolute inset-0 z-10"
                onError={(e) => {
                  console.log("❌ Image failed:", sub.slug, "tried:", e.target.src);
                  e.target.style.display = 'none';
                }}
                onLoad={() => console.log("✅ Image loaded:", sub.slug)}
              />
              
              {/* Fallback: Letter avatar */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F8BBD9] to-[#FCE4EC] flex items-center justify-center text-[#C2185B] font-bold text-lg">
                {sub.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <span className="text-xs font-bold text-center whitespace-nowrap">
              {sub.name}
            </span>
            
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              sub.slug === subcategorySlug
                ? "bg-white/20 text-white"
                : "bg-[#C2185B]/10 text-[#C2185B]"
            }`}>
              {sub.productCount || 0} items
            </span>

            {sub.slug === subcategorySlug && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-1 w-8 h-1 bg-white rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  </div>
)}

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mx-auto px-4 py-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ===== FILTERS SIDEBAR ===== */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                <motion.div 
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white h-full w-80 overflow-y-auto p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#880E4F] flex items-center gap-2">
                      <Filter size={20} /> Filters
                    </h3>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="w-8 h-8 bg-[#FFF5F7] rounded-full flex items-center justify-center text-[#C2185B]"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="text-sm font-bold text-[#880E4F] mb-2 block">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-4 py-3 bg-[#FFF5F7] border border-[#F8BBD9]/50 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="text-sm font-bold text-[#880E4F] mb-3 block">Price Range</label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full accent-[#C2185B] h-2 bg-[#F8BBD9] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2 text-sm font-semibold text-[#880E4F]">
                        <span>Rs. 0</span>
                        <span>Rs. {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {(searchQuery || priceRange[1] < 50000) && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[#880E4F]">Active</span>
                        <button 
                          onClick={() => { setSearchQuery(""); setPriceRange([0, 50000]); }}
                          className="text-xs text-[#C2185B] hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C2185B]/10 text-[#C2185B] rounded-full text-xs font-medium">
                            "{searchQuery}" <button onClick={() => setSearchQuery("")}><X size={12} /></button>
                          </span>
                        )}
                        {priceRange[1] < 50000 && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C2185B]/10 text-[#C2185B] rounded-full text-xs font-medium">
                            Under Rs. {priceRange[1]} <button onClick={() => setPriceRange([0, 50000])}><X size={12} /></button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Promo Box */}
                  <div className="bg-[#FFF5F7] rounded-xl p-4 border border-[#F8BBD9]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#C2185B] rounded-lg flex items-center justify-center text-white">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#880E4F]">Special Offer</p>
                        <p className="text-xs text-gray-500">Get 20% off on first order</p>
                      </div>
                    </div>
                    <button className="w-full mt-2 py-2 bg-[#C2185B] text-white rounded-lg text-sm font-semibold hover:bg-[#880E4F] transition-colors">
                      Shop Now
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-xl shadow-[#C2185B]/5 border border-[#F8BBD9]/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-[#880E4F] mb-6 flex items-center gap-2">
                <SlidersHorizontal size={20} /> Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-bold text-[#880E4F] mb-2 block">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-3 bg-[#FFF5F7] border border-[#F8BBD9]/50 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/20 transition-all"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-bold text-[#880E4F] mb-3 block">Price Range</label>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#C2185B] h-2 bg-[#F8BBD9] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-sm font-semibold text-[#880E4F]">
                    <span>Rs. 0</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchQuery || priceRange[1] < 50000) && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#880E4F]">Active</span>
                    <button 
                      onClick={() => { setSearchQuery(""); setPriceRange([0, 50000]); }}
                      className="text-xs text-[#C2185B] hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C2185B]/10 text-[#C2185B] rounded-full text-xs font-medium">
                        "{searchQuery}" <button onClick={() => setSearchQuery("")}><X size={12} /></button>
                      </span>
                    )}
                    {priceRange[1] < 50000 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C2185B]/10 text-[#C2185B] rounded-full text-xs font-medium">
                        Under Rs. {priceRange[1]} <button onClick={() => setPriceRange([0, 50000])}><X size={12} /></button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Promo Box */}
              <div className="bg-[#FFF5F7] rounded-xl p-4 border border-[#F8BBD9]/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#C2185B] rounded-lg flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#880E4F]">Special Offer</p>
                    <p className="text-xs text-gray-500">Get 20% off on first order</p>
                  </div>
                </div>
                <button className="w-full mt-2 py-2 bg-[#C2185B] text-white rounded-lg text-sm font-semibold hover:bg-[#880E4F] transition-colors">
                  Shop Now
                </button>
              </div>
            </div>
          </aside>

          {/* ===== PRODUCTS AREA ===== */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#F8BBD9]/30 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#FFF5F7] text-[#C2185B] rounded-lg font-medium text-sm"
                >
                  <SlidersHorizontal size={18} /> Filters
                </button>
                
                <span className="text-sm text-gray-500">
                  Showing <span className="font-bold text-[#880E4F]">{filteredProducts.length}</span> of {products?.length || 0} products
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FFF5F7] text-[#880E4F] rounded-lg text-sm font-medium hover:bg-[#F8BBD9]/20 transition-colors"
                  >
                    <ArrowUpDown size={16} />
                    {sortOptions.find(s => s.value === sortBy)?.label}
                    <ChevronRight size={14} className={`transition-transform ${showSortDropdown ? "rotate-90" : ""}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl shadow-[#C2185B]/10 border border-[#F8BBD9]/30 overflow-hidden z-20"
                      >
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              sortBy === option.value 
                                ? "bg-[#FFF5F7] text-[#C2185B] font-semibold" 
                                : "text-gray-600 hover:bg-[#FFF5F7]"
                            }`}
                          >
                            <option.icon size={16} />
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Toggle */}
                <div className="hidden sm:flex bg-[#FFF5F7] rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#C2185B] shadow-sm" : "text-gray-400"}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#C2185B] shadow-sm" : "text-gray-400"}`}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

           {/* Products Grid/List */}
{loading ? (
  <div className={`grid gap-6 ${
    viewMode === "grid" 
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
      : "grid-cols-1"
  }`}>
    {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
  </div>
) : filteredProducts.length === 0 ? (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-20"
  >
    <Package size={64} className="mx-auto text-[#C2185B] mb-4 opacity-30" />
    <h3 className="text-xl font-bold text-[#880E4F] mb-2">No Products Found</h3>
    <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
    <button 
      onClick={() => { setSearchQuery(""); setPriceRange([0, 50000]); }}
      className="px-6 py-2 bg-[#C2185B] text-white rounded-full font-medium hover:bg-[#880E4F] transition-colors"
    >
      Clear Filters
    </button>
  </motion.div>
) : (
  <motion.div 
    layout
    className={`grid gap-6 ${
      viewMode === "grid" 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    }`}>
    <AnimatePresence>
      {filteredProducts.map((product, index) => (
        <motion.div
          key={product._id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: index * 0.05 }}
          className={`group relative bg-white rounded-2xl border border-[#F8BBD9]/30 overflow-hidden hover:shadow-2xl hover:shadow-[#C2185B]/10 transition-all duration-500 ${
            viewMode === "list" ? "flex flex-col sm:flex-row" : ""
          }`}
        >
          {/* ===== IMAGE AREA - LINK WRAPPED ===== */}
          <div className={`relative overflow-hidden bg-[#FFF5F7] ${viewMode === "list" ? "sm:w-72 shrink-0" : "aspect-square"}`}>
            <Link to={`/product/${product._id}`} className="block w-full h-full">
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src={product.images?.[0] || product.image || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </Link>
            
            {/* Overlay Actions - OUTSIDE LINK */}
            <div className="absolute inset-0 bg-[#880E4F]/0 group-hover:bg-[#880E4F]/20 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuickView(product)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C2185B] shadow-lg pointer-events-auto"
              >
                <Eye size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleWishlist(product._id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg pointer-events-auto ${
                  wishlist.includes(product._id) ? "bg-[#C2185B] text-white" : "bg-white text-[#C2185B]"
                }`}
              >
                <Heart size={20} fill={wishlist.includes(product._id) ? "currentColor" : "none"} />
              </motion.button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
              {product.discountedPrice && product.discountedPrice < product.price && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm bg-[#C2185B]/10 text-[#C2185B] border-[#C2185B]/20">
                  {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  New
                </span>
              )}
              {product.rating >= 4.5 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Top Rated
                </span>
              )}
            </div>
          </div>

          {/* ===== CONTENT AREA - LINK WRAPPED ===== */}
          <Link to={`/product/${product._id}`} className="p-5 flex-1 flex flex-col block">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs text-[#C2185B] font-semibold uppercase tracking-wider mb-1">
                  {subcategoryName}
                </p>
                <h3 className="font-bold text-[#2D2D2D] group-hover:text-[#C2185B] transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
              {product.description}
            </p>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"} 
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.reviews?.length || 0})</span>
              </div>
            )}

            {/* Price & CTA */}
            <div className="flex items-end justify-between mt-auto pt-3 border-t border-[#F8BBD9]/20">
              <div>
                <p className="text-2xl font-bold text-[#C2185B]">
                  Rs. {product.discountedPrice || product.price}
                </p>
                {product.discountedPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    Rs. {product.price}
                  </p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                className="w-12 h-12 bg-[#C2185B] hover:bg-[#880E4F] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#C2185B]/30 transition-colors"
              >
                <ShoppingCart size={20} />
              </motion.button>
            </div>
          </Link>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
)}
          </div>
        </div>
      </div>

      {/* ===== QUICK VIEW MODAL ===== */}
      <AnimatePresence>
        {quickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQuickView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative bg-[#FFF5F7] p-8 flex items-center justify-center">
                  <img 
                    src={quickView.images?.[0] || quickView.image} 
                    alt={quickView.name}
                    className="max-h-80 object-contain"
                  />
                  <button 
                    onClick={() => setQuickView(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#C2185B] shadow-md"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8">
                  <p className="text-sm text-[#C2185B] font-bold uppercase tracking-wider mb-2">
                    {subcategoryName}
                  </p>
                  <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">{quickView.name}</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">{quickView.description}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-[#C2185B]">Rs. {quickView.discountedPrice || quickView.price}</span>
                    {quickView.discountedPrice && (
                      <span className="text-xl text-gray-400 line-through">Rs. {quickView.price}</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { addToCart(quickView); setQuickView(null); }}
                      className="flex-1 py-4 bg-[#C2185B] text-white rounded-xl font-bold hover:bg-[#880E4F] transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} /> Add to Cart
                    </button>
                    <button 
                      onClick={() => navigate(`/product/${quickView._id}`)}
                      className="px-6 py-4 border-2 border-[#C2185B] text-[#C2185B] rounded-xl font-bold hover:bg-[#FFF5F7] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubCategoryPage;