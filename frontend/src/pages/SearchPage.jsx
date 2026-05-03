import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, X, ShoppingCart, Heart, Star, SlidersHorizontal } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import toast from "react-hot-toast";

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const { products, loading, searchProducts, fetchAllProducts } = useProductStore();
    const { addToCart } = useCartStore();
    
    const [searchInput, setSearchInput] = useState(query);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("relevance");
    const [showFilters, setShowFilters] = useState(false);

    // Search products when query changes
    useEffect(() => {
        if (query && query.trim() !== "") {
            searchProducts(query);
        } else {
            fetchAllProducts();
        }
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput.trim() });
        } else {
            setSearchParams({});
        }
    };

    // Filter and sort products
    const filteredProducts = products.filter(product => {
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesCategory = selectedCategory === "all" || product.category?.main === selectedCategory || product.category === selectedCategory;
        return matchesPrice && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
    });

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
    };

    // Get unique categories from products
    const categories = ["all", ...new Set(products.map(p => p.category?.main || p.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-[#FFF5F7] py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Search Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-[#880E4F] mb-4">
                        Search Results
                    </h1>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-white border-2 border-[#F8BBD9] rounded-full py-3 pl-12 pr-32 text-[#2D2D2D] focus:outline-none focus:border-[#C2185B] shadow-md"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C2185B]" size={20} />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C2185B] text-white px-6 py-1.5 rounded-full hover:bg-[#880E4F] transition-colors font-medium"
                        >
                            Search
                        </button>
                    </form>

                    {query && (
                        <p className="mt-3 text-gray-600">
                            Showing results for: <span className="font-semibold text-[#C2185B]">"{query}"</span>
                            <span className="ml-2 text-sm">({filteredProducts.length} items found)</span>
                        </p>
                    )}
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}
                    >
                        <div className="bg-white rounded-2xl shadow-lg border border-[#F8BBD9]/30 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-[#880E4F] flex items-center gap-2">
                                    <SlidersHorizontal size={18} />
                                    Filters
                                </h3>
                                <button 
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-sm text-gray-700 mb-3">Category</h4>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-[#FFF5F7] p-1.5 rounded-lg transition-colors">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={selectedCategory === cat}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="accent-[#C2185B]"
                                            />
                                            <span className="text-sm capitalize text-gray-600">
                                                {cat === "all" ? "All Categories" : cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-sm text-gray-700 mb-3">Price Range</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                            className="w-full border border-[#F8BBD9] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#C2185B]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                            className="w-full border border-[#F8BBD9] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#C2185B]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sort By */}
                            <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-3">Sort By</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full border border-[#F8BBD9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C2185B] bg-white"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>

                            {/* Reset Filters */}
                            <button
                                onClick={() => {
                                    setPriceRange([0, 10000]);
                                    setSelectedCategory("all");
                                    setSortBy("relevance");
                                }}
                                className="w-full mt-6 py-2 text-sm text-[#C2185B] border border-[#C2185B] rounded-lg hover:bg-[#FFF5F7] transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </motion.div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden mb-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-[#F8BBD9] text-[#C2185B] font-medium"
                        >
                            <Filter size={18} />
                            Filters
                        </button>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                        <div className="bg-gray-200 h-48 rounded-xl mb-4" />
                                        <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                                        <div className="bg-gray-200 h-4 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-[#F8BBD9]/20 overflow-hidden group transition-all duration-300"
                                    >
                                        {/* Product Image */}
                                        <Link to={`/product/${product._id}`} className="block relative">
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={product.image || "/placeholder.png"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            {product.isFeatured && (
                                                <span className="absolute top-3 left-3 bg-[#C2185B] text-white text-xs px-3 py-1 rounded-full font-medium">
                                                    Featured
                                                </span>
                                            )}
                                            <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFF5F7]">
                                                <Heart size={16} className="text-[#C2185B]" />
                                            </button>
                                        </Link>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="text-xs text-[#C2185B] font-medium uppercase tracking-wide mb-1">
                                                        {product.category?.main || product.category}
                                                    </p>
                                                    <Link to={`/product/${product._id}`}>
                                                        <h3 className="font-bold text-[#2D2D2D] line-clamp-2 hover:text-[#C2185B] transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < (product.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                    />
                                                ))}
                                                <span className="text-xs text-gray-500 ml-1">({product.reviews?.length || 0})</span>
                                            </div>

                                            {/* Price & Add to Cart */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xl font-bold text-[#880E4F]">
                                                        ${product.price}
                                                    </span>
                                                    {product.originalPrice && (
                                                        <span className="text-sm text-gray-400 line-through ml-2">
                                                            ${product.originalPrice}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="p-2.5 bg-[#C2185B] text-white rounded-full hover:bg-[#880E4F] transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20"
                            >
                                <div className="w-24 h-24 bg-[#FFF5F7] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search size={40} className="text-[#C2185B]" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#880E4F] mb-2">
                                    No products found
                                </h2>
                                <p className="text-gray-500 mb-6">
                                    We couldn't find any products matching "{query}"
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchInput("");
                                        setSearchParams({});
                                    }}
                                    className="bg-[#C2185B] text-white px-6 py-2.5 rounded-full hover:bg-[#880E4F] transition-colors font-medium"
                                >
                                    Clear Search
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;