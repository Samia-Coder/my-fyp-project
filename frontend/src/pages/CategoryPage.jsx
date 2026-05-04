import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid3X3, LayoutList, ChevronDown, 
  ArrowUpDown, Heart, ShoppingCart, Eye, 
  Sparkles, X, SlidersHorizontal, Tag,
  TrendingUp, Star, Package, Search,
  ArrowRight, Home
} from "lucide-react";
import { useCategoryStore } from "../stores/useCategoryStore";
import { useProductStore } from "../stores/useProductStore";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageComponent from "../components/ImageComponent"; // ✅ NEW: Image optimization

const AnimatedCounter = ({ value, label }) => (
  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
    <span className="text-xl sm:text-2xl font-bold text-brand-primary">{value}</span>
    <span className="text-[10px] sm:text-xs text-white uppercase tracking-wider">{label}</span>
  </motion.div>
);

const GlassBadge = ({ children, color = "pink" }) => {
  const colors = {
    pink: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    gold: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  };
  return (
    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border backdrop-blur-sm ${colors[color]}`}>
      {children}
    </span>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100">
    <div className="aspect-square bg-gray-200 rounded-xl animate-pulse mb-3 sm:mb-4" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-3 sm:mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
      <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8" />
    </div>
  </div>
);

const CategoryPage = () => {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams();
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const { products, fetchProductsByCategory, loading: productsLoading } = useProductStore();

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedSubcat, setSelectedSubcat] = useState(subcategorySlug || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const currentCategory = useMemo(() => {
    return categories.find(c => c.slug === categorySlug) || null;
  }, [categories, categorySlug]);

  useEffect(() => {
    const loadData = async () => {
      setCategoryLoading(true);
      try {
        if (categories.length === 0) {
          await fetchCategories();
        }
        await fetchProductsByCategory(categorySlug);
      } catch (error) {
        console.log("Error loading data:", error);
      } finally {
        setCategoryLoading(false);
      }
    };
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categorySlug, categories.length, fetchCategories, fetchProductsByCategory]);

  useEffect(() => {
    setSelectedSubcat(subcategorySlug || null);
  }, [subcategorySlug]);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSubcatClick = (slug) => {
    if (!slug) {
      setSelectedSubcat(null);
      navigate(`/category/${categorySlug}`);
    } else if (selectedSubcat === slug) {
      setSelectedSubcat(null);
      navigate(`/category/${categorySlug}`);
    } else {
      setSelectedSubcat(slug);
      navigate(`/category/${categorySlug}/${slug}`);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (searchQuery) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSubcat) {
      result = result.filter(p => {
        const productSubcat = p.subcategory || p.subCategory || p.category?.sub || p.category?.subcategory;
        return productSubcat === selectedSubcat;
      });
    }

    result = result.filter(p => {
      const price = p.discountedPrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case "price-low": result.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price)); break;
      case "price-high": result.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price)); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "name": result.sort((a, b) => a.name?.localeCompare(b.name)); break;
      default: break;
    }

    return result;
  }, [products, searchQuery, selectedSubcat, priceRange, sortBy]);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const sortOptions = [
    { value: "featured", label: "Featured", icon: Sparkles },
    { value: "price-low", label: "Price: Low to High", icon: TrendingUp },
    { value: "price-high", label: "Price: High to Low", icon: TrendingUp },
    { value: "newest", label: "Newest First", icon: Package },
    { value: "rating", label: "Top Rated", icon: Star },
    { value: "name", label: "Name A-Z", icon: ArrowUpDown },
  ];

  const addToCart = (product) => {
    console.log("Added to cart:", product);
  };

  const selectedSubcatName = useMemo(() => {
    if (!selectedSubcat || !currentCategory?.subcategories) return null;
    return currentCategory.subcategories.find(s => s.slug === selectedSubcat)?.name || selectedSubcat;
  }, [selectedSubcat, currentCategory]);

  if (categoryLoading || productsLoading) return <LoadingSpinner />;

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Package size={48} className="mx-auto text-brand-primary mb-4 opacity-50 sm:size-16" />
          <h2 className="text-xl sm:text-2xl font-bold text-brand-dark mb-2">Category Not Found</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6">The category you're looking for doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-dark transition-all text-sm sm:text-base">
            <ArrowRight size={16} /> Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      <div className="fixed top-20 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] overflow-hidden flex items-center">
        <motion.div initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <ImageComponent 
            src={currentCategory.image || "/images/banner.jpg"} 
            alt={currentCategory.name} 
            className="w-full h-full"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-brand-dark/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/20 rounded-full"
              animate={{ y: [0, -100, 0], x: [0, Math.random() * 50 - 25, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.5 }}
              style={{ left: `${15 + i * 15}%`, bottom: "10%" }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  <Home size={14} /> Home
                </Link>
                <ArrowRight size={12} className="rotate-0" />
                <span className="text-white font-medium">{currentCategory.name}</span>
                {selectedSubcatName && (
                  <>
                    <ArrowRight size={12} />
                    <span className="text-white font-medium">{selectedSubcatName}</span>
                  </>
                )}
              </motion.div>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 border border-white/20">
                <Sparkles size={24} className="text-white sm:size-8 md:size-10" />
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-3 md:mb-4 tracking-tight">
                {selectedSubcatName || currentCategory.name}
              </h1>
              
              <p className="text-sm sm:text-base md:text-xl text-white/80 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-4">
                {selectedSubcatName 
                  ? `Explore our ${selectedSubcatName.toLowerCase()} collection with the best deals.`
                  : (currentCategory.description || `Discover our premium collection of ${currentCategory.name.toLowerCase()} curated just for you.`)
                }
              </p>

              <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12">
                <AnimatedCounter value={currentCategory.subcategories?.length || 0} label="Subcategories" />
                <div className="w-px h-8 sm:h-10 bg-white/20" />
                <AnimatedCounter value={filteredProducts.length} label="Products" />
                <div className="w-px h-8 sm:h-10 bg-white/20" />
                <AnimatedCounter value="4.8" label="Rating" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-[-2px] left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFF5F7"/>
          </svg>
        </div>
      </div>

      {currentCategory.subcategories?.length > 0 && (
        <div className="container mx-auto px-3 sm:px-4 mt-6 sm:mt-8 md:mt-12 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl shadow-xl shadow-brand-primary/10 p-3 sm:p-4 md:p-6 border border-brand-accent/30">
            <h3 className="text-xs sm:text-sm font-bold text-brand-dark uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <Tag size={14} /> Browse Subcategories
            </h3>
            
            <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleSubcatClick(null)}
                className={`flex-shrink-0 snap-start group relative overflow-hidden rounded-xl p-2.5 sm:p-3 md:p-4 min-w-[100px] sm:min-w-[120px] md:min-w-[130px] transition-all duration-300 ${
                  !selectedSubcat
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                    : "bg-brand-bg text-brand-dark hover:bg-brand-primary hover:text-white"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold ${
                    !selectedSubcat ? "bg-white/20" : "bg-brand-primary/10 group-hover:bg-white/20"
                  }`}>
                    <Grid3X3 size={18} className="sm:size-5 md:size-6" />
                  </div>
                  <span className="font-semibold text-[11px] sm:text-xs md:text-sm text-center leading-tight">All</span>
                  <span className={`text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                    !selectedSubcat ? "bg-white/20" : "bg-brand-primary/10 text-brand-primary group-hover:bg-white/20 group-hover:text-white"
                  }`}>
                    {products?.length || 0} items
                  </span>
                </div>
              </motion.button>

              {currentCategory.subcategories.map((sub, index) => {
                const isActive = selectedSubcat === sub.slug;
                const itemCount = sub.productCount || sub.itemCount || sub.productsCount || sub.count || 0;
                
                const getImageUrl = () => {
                  if (!sub.image) return null;
                  if (sub.image.startsWith('http')) return sub.image;
                  if (sub.image.startsWith('/')) return sub.image;
                  return `/image/subcategoriesimage/${sub.image}`;
                };
                
                const imageUrl = getImageUrl();
                
                return (
                  <motion.button
                    key={sub.slug}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 1) * 0.1 }}
                    onClick={() => handleSubcatClick(sub.slug)}
                    className={`flex-shrink-0 snap-start group relative overflow-hidden rounded-xl p-2.5 sm:p-3 md:p-4 min-w-[100px] sm:min-w-[120px] md:min-w-[130px] transition-all duration-300 ${
                      isActive
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                        : "bg-brand-bg text-brand-dark hover:bg-brand-primary hover:text-white"
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold overflow-hidden ${
                        isActive ? "bg-white/20" : "bg-brand-primary/10 group-hover:bg-white/20"
                      }`}>
                        {imageUrl ? (
                          <ImageComponent 
                            src={imageUrl}
                            alt={sub.name}
                            className="w-full h-full"
                          />
                        ) : null}
                      </div>
                      <span className="font-semibold text-[11px] sm:text-xs md:text-sm text-center leading-tight line-clamp-2">{sub.name}</span>
                      <span className={`text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                        isActive 
                          ? "bg-white/20" 
                          : itemCount > 0 
                            ? "bg-brand-primary/10 text-brand-primary group-hover:bg-white/20 group-hover:text-white" 
                            : "bg-gray-100 text-gray-400 group-hover:bg-white/20 group-hover:text-white"
                      }`}>
                        {itemCount > 0 ? `${itemCount} items` : "New"}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 pb-16 sm:pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          <AnimatePresence>
            {(showFilters || isDesktop) && (
              <motion.aside
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`${showFilters && !isDesktop ? "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" : "hidden lg:block"} lg:relative lg:bg-transparent lg:backdrop-blur-none lg:z-auto`}
              >
                <motion.div 
                  className={`bg-white rounded-2xl shadow-xl shadow-brand-primary/5 border border-brand-accent/30 p-4 sm:p-6 h-fit ${
                    showFilters && !isDesktop ? "fixed left-0 top-0 h-full w-[280px] sm:w-80 overflow-y-auto" : "w-full lg:w-72"
                  }`}
                >
                  <div className="lg:hidden flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-brand-dark">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="w-8 h-8 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs sm:text-sm font-bold text-brand-dark mb-2 block">
                      Search in {selectedSubcatName || currentCategory.name}
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-brand-bg border border-brand-accent/50 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs sm:text-sm font-bold text-brand-dark mb-3 block">Price Range</label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-brand-primary h-2 bg-brand-accent rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2 text-xs sm:text-sm font-semibold text-brand-dark">
                        <span>Rs. {priceRange[0]}</span>
                        <span>Rs. {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {(selectedSubcat || searchQuery || priceRange[1] < 50000) && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold text-brand-dark">Active Filters</span>
                        <button 
                          onClick={() => { 
                            setSelectedSubcat(null); 
                            setSearchQuery(""); 
                            setPriceRange([0, 50000]); 
                            navigate(`/category/${categorySlug}`);
                          }} 
                          className="text-[10px] sm:text-xs text-brand-primary hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {selectedSubcat && (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] sm:text-xs font-medium">
                            {selectedSubcatName} 
                            <button onClick={() => { setSelectedSubcat(null); navigate(`/category/${categorySlug}`); }}>
                              <X size={10} />
                            </button>
                          </span>
                        )}
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] sm:text-xs font-medium">
                            "{searchQuery}" <button onClick={() => setSearchQuery("")}><X size={10} /></button>
                          </span>
                        )}
                        {priceRange[1] < 50000 && (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] sm:text-xs font-medium">
                            Under Rs. {priceRange[1]} <button onClick={() => setPriceRange([0, 50000])}><X size={10} /></button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="text-xs sm:text-sm font-bold text-brand-dark mb-3 block">Subcategories</label>
                    <div className="space-y-2">
                      <label 
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                        onClick={() => { setSelectedSubcat(null); navigate(`/category/${categorySlug}`); }}
                      >
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          !selectedSubcat ? "bg-brand-primary border-brand-primary" : "border-brand-accent group-hover:border-brand-primary"
                        }`}>
                          {!selectedSubcat && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-xs sm:text-sm ${!selectedSubcat ? "text-brand-primary font-semibold" : "text-gray-600"}`}>
                          All Products
                        </span>
                        <span className="ml-auto text-[10px] sm:text-xs text-gray-400">{products?.length || 0}</span>
                      </label>

                      {currentCategory.subcategories?.map(sub => (
                        <label 
                          key={sub.slug} 
                          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                          onClick={() => { setSelectedSubcat(sub.slug); navigate(`/category/${categorySlug}/${sub.slug}`); }}
                        >
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedSubcat === sub.slug ? "bg-brand-primary border-brand-primary" : "border-brand-accent group-hover:border-brand-primary"
                          }`}>
                            {selectedSubcat === sub.slug && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className={`text-xs sm:text-sm ${selectedSubcat === sub.slug ? "text-brand-primary font-semibold" : "text-gray-600"}`}>
                            {sub.name}
                          </span>
                          <span className="ml-auto text-[10px] sm:text-xs text-gray-400">{sub.productCount || 0}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-brand-bg rounded-xl p-3 sm:p-4 border border-brand-accent/30">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white shrink-0">
                        <Sparkles size={16} className="sm:size-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-brand-dark">Special Offer</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Get 20% off on first order</p>
                      </div>
                    </div>
                    <button className="w-full mt-2 py-2 bg-brand-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-brand-dark transition-colors">
                      Shop Now
                    </button>
                  </div>
                </motion.div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-brand-accent/30 p-3 sm:p-4 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-bg text-brand-primary rounded-lg font-medium text-xs sm:text-sm">
                  <SlidersHorizontal size={16} /> Filters
                </button>
                <span className="text-xs sm:text-sm text-gray-500">
                  Showing <span className="font-bold text-brand-dark">{filteredProducts.length}</span> of {products?.length || 0} products
                  {selectedSubcatName && <span className="text-brand-primary"> in {selectedSubcatName}</span>}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)} 
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-bg text-brand-dark rounded-lg text-xs sm:text-sm font-medium hover:bg-brand-accent/20 transition-colors"
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">{sortOptions.find(s => s.value === sortBy)?.label}</span>
                    <span className="sm:hidden">Sort</span>
                    <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-white rounded-xl shadow-xl shadow-brand-primary/10 border border-brand-accent/30 overflow-hidden z-20"
                      >
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                              sortBy === option.value ? "bg-brand-bg text-brand-primary font-semibold" : "text-gray-600 hover:bg-brand-bg"
                            }`}
                          >
                            <option.icon size={14} />
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="hidden sm:flex bg-brand-bg rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode("grid")} 
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-brand-primary shadow-sm" : "text-gray-400"}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")} 
                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-brand-primary shadow-sm" : "text-gray-400"}`}
                  >
                    <LayoutList size={16} />
                  </button>
                </div>
              </div>
            </div>

            {productsLoading ? (
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}>
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 sm:py-20">
                <Package size={48} className="mx-auto text-brand-primary mb-4 opacity-30 sm:size-16" />
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-2">No Products Found</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {selectedSubcatName 
                    ? `No products available in ${selectedSubcatName}.` 
                    : "Try adjusting your filters or search query."
                  }
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {selectedSubcat && (
                    <button 
                      onClick={() => { setSelectedSubcat(null); navigate(`/category/${categorySlug}`); }} 
                      className="px-5 sm:px-6 py-2 sm:py-2.5 bg-brand-primary text-white rounded-full font-medium hover:bg-brand-dark transition-colors text-sm"
                    >
                      Show All Products
                    </button>
                  )}
                  <button 
                    onClick={() => { 
                      setSelectedSubcat(null); 
                      setSearchQuery(""); 
                      setPriceRange([0, 50000]); 
                      navigate(`/category/${categorySlug}`);
                    }} 
                    className="px-5 sm:px-6 py-2 sm:py-2.5 border-2 border-brand-primary text-brand-primary rounded-full font-medium hover:bg-brand-bg transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div layout className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
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
                      className={`group relative bg-white rounded-2xl border border-brand-accent/30 overflow-hidden hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 ${
                        viewMode === "list" ? "flex flex-col sm:flex-row gap-0" : ""
                      }`}
                    >
                      <div className={`relative overflow-hidden bg-brand-bg ${
                        viewMode === "list" ? "w-full sm:w-56 md:w-64 lg:w-72 h-48 sm:h-auto shrink-0" : "aspect-square"
                      }`}>
                        <Link to={`/product/${product._id}`} className="block w-full h-full">
                          <ImageComponent 
                            src={product.images?.[0] || product.image || "/placeholder.jpg"}
                            alt={product.name}
                            className="w-full h-full"
                          />
                        </Link>
                        
                        <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                          <motion.button 
                            whileHover={{ scale: 1.1 }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={(e) => { e.stopPropagation(); setQuickView(product); }}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-lg pointer-events-auto"
                          >
                            <Eye size={16} className="sm:size-5" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg pointer-events-auto ${
                              wishlist.includes(product._id) ? "bg-brand-primary text-white" : "bg-white text-brand-primary"
                            }`}
                          >
                            <Heart size={16} className="sm:size-5" fill={wishlist.includes(product._id) ? "currentColor" : "none"} />
                          </motion.button>
                        </div>

                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 pointer-events-none">
                          {product.discountedPrice && product.discountedPrice < product.price && (
                            <GlassBadge color="pink">{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF</GlassBadge>
                          )}
                          {product.isNew && <GlassBadge color="green">New</GlassBadge>}
                          {product.rating >= 4.5 && <GlassBadge color="gold">Top</GlassBadge>}
                        </div>
                      </div>

                      <Link to={`/product/${product._id}`} className="p-3 sm:p-5 flex-1 flex flex-col min-w-0 block">
                        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-brand-primary font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">
                              {product.subcategory || product.subCategory || product.category?.sub || currentCategory.name}
                            </p>
                            <h3 className="font-bold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 text-sm sm:text-base">
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-4 flex-1">
                          {product.description}
                        </p>

                        {product.rating && (
                          <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={`sm:size-[14px] ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                            ))}
                            <span className="text-[10px] sm:text-xs text-gray-500 ml-1">({product.reviews?.length || 0})</span>
                          </div>
                        )}

                        <div className="flex items-end justify-between mt-auto pt-2 sm:pt-3 border-t border-brand-accent/20">
                          <div>
                            <p className="text-lg sm:text-2xl font-bold text-brand-primary">
                              Rs. {product.discountedPrice || product.price}
                            </p>
                            {product.discountedPrice && (
                              <p className="text-xs sm:text-sm text-gray-400 line-through">
                                Rs. {product.price}
                              </p>
                            )}
                          </div>
                          
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary hover:bg-brand-dark text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30 transition-colors shrink-0"
                          >
                            <ShoppingCart size={16} className="sm:size-5" />
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

      <AnimatePresence>
        {quickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={() => setQuickView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col md:grid md:grid-cols-2">
                <div className="relative bg-brand-bg p-4 sm:p-8 flex items-center justify-center">
                  <ImageComponent 
                    src={quickView.images?.[0] || quickView.image} 
                    alt={quickView.name} 
                    className="max-h-48 sm:max-h-80"
                  />
                  <button onClick={() => setQuickView(null)} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-md">
                    <X size={16} className="sm:size-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-8">
                  <p className="text-xs sm:text-sm text-brand-primary font-bold uppercase tracking-wider mb-2">
                    {quickView.subcategory || quickView.subCategory || quickView.category?.sub || currentCategory.name}
                  </p>
                  <h2 className="text-xl sm:text-3xl font-bold text-text-primary mb-2 sm:mb-4">{quickView.name}</h2>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">{quickView.description}</p>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl font-bold text-brand-primary">Rs. {quickView.discountedPrice || quickView.price}</span>
                    {quickView.discountedPrice && (
                      <span className="text-lg sm:text-xl text-gray-400 line-through">Rs. {quickView.price}</span>
                    )}
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <button 
                      onClick={() => { addToCart(quickView); setQuickView(null); }} 
                      className="flex-1 py-3 sm:py-4 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <ShoppingCart size={18} className="sm:size-5" /> Add to Cart
                    </button>
                    <button 
                      onClick={() => navigate(`/product/${quickView._id}`)} 
                      className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-brand-primary text-brand-primary rounded-xl font-bold hover:bg-brand-bg transition-colors text-sm sm:text-base"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-brand-primary text-white rounded-full shadow-2xl shadow-brand-primary/40 flex items-center justify-center z-40"
      >
        <ShoppingCart size={20} className="sm:size-6" />
      </motion.button>
    </div>
  );
};

export default CategoryPage;