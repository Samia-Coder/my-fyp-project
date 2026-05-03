import { useState, useEffect, useRef } from "react";
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Search, Menu, X, Heart, Sparkles, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";

const Navbar = () => {
    const { user, logout } = useUserStore();
    const isAdmin = user?.role === "admin";
    const { cart } = useCartStore();
    const { wishlist } = useWishlistStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [wishlistBounce, setWishlistBounce] = useState(false);
    const location = useLocation();
    const profileBtnRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

    // Calculate dropdown position
    useEffect(() => {
        if (profileDropdown && profileBtnRef.current) {
            const rect = profileBtnRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [profileDropdown]);

    // Close dropdown on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (profileDropdown) setProfileDropdown(false);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [profileDropdown]);

    // Wishlist bounce animation trigger
    useEffect(() => {
        if (wishlist.length > 0) {
            setWishlistBounce(true);
            const timer = setTimeout(() => setWishlistBounce(false), 500);
            return () => clearTimeout(timer);
        }
    }, [wishlist.length]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdown(false);
    }, [location]);

    return (
        <>
            {/* Top Bar */}
            <div className={`bg-[#880E4F] text-white text-xs py-2 transition-all duration-300 ${isScrolled ? 'hidden' : 'block'}`}>
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Sparkles size={12} className="text-[#F8BBD9]" />
                            Free Shipping on orders over $50
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                        <span>Customer Support: 24/7</span>
                        <span className="text-[#F8BBD9]">|</span>
                        <span>Track Order</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar - z-[9999] taake sab se upar rahe */}
            <header 
                className={`sticky top-0 left-0 w-full z-[9999] transition-all duration-500 ${
                    isScrolled 
                        ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-[#C2185B]/10 border-b border-[#F8BBD9]/30' 
                        : 'bg-white shadow-md'
                }`}
            >
                <div className='container mx-auto px-4 py-3'>
                    <div className='flex items-center justify-between gap-4'>
                        {/* ===== LOGO + SAFIRA MART - STYLISH ===== */}
                        <Link to='/' className='flex items-center gap-3 group'>
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-12 h-12"
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                                
                                {/* Logo Container */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-full flex items-center justify-center shadow-lg shadow-[#C2185B]/30 overflow-hidden">
                                    {!logoError ? (
                                        <img 
                                            src="/image/Untitled_design__9_-removebg-preview.png" 
                                            alt="Safira Mart"
                                            className="w-10 h-10 object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <span className="text-white font-bold text-lg">S</span>
                                    )}
                                </div>
                                {/* Badge Dot */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#F8BBD9] rounded-full border-2 border-white animate-pulse" />
                            </motion.div>
                            
                            {/* Brand Name - Stylish */}
                            <div className="hidden sm:block">
                                <motion.h1 
                                    className="text-2xl font-black tracking-tight"
                                    style={{
                                        background: 'linear-gradient(135deg, #880E4F 0%, #C2185B 50%, #E91E63 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    Safira Mart
                                </motion.h1>
                                <p className="text-[10px] text-[#E91E63] -mt-1 tracking-[0.2em] uppercase font-semibold">
                                    Premium Shopping
                                </p>
                            </div>
                        </Link>

                        {/* ====== SEARCH BAR - DESKTOP (FUNCTIONAL) ====== */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const searchInput = e.target.search.value;
                                if (searchInput.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
                                }
                            }} className="relative w-full group">
                                <input 
                                    name="search"
                                    type="text" 
                                    placeholder="Search products, brands, categories..."
                                    className="w-full bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-full py-2.5 pl-12 pr-24 text-sm text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300 shadow-inner"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C2185B] group-hover:scale-110 transition-transform" size={18} />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C2185B] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#880E4F] transition-colors"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* Right Actions */}
                        <div className='flex items-center gap-2 sm:gap-3'>
                            <button 
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="md:hidden p-2 text-[#C2185B] hover:bg-[#FFF5F7] rounded-full transition-colors"
                            >
                                <Search size={20} />
                            </button>

                            {/* ====== WISHLIST ICON WITH BADGE ====== */}
                            <Link 
                                to="/wishlist" 
                                className="hidden sm:flex p-2.5 rounded-full transition-colors relative group"
                            >
                                <motion.div
                                    animate={wishlistBounce ? { scale: [1, 1.4, 1] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Heart 
                                        size={22} 
                                        className={`transition-all duration-300 ${
                                            wishlist.length > 0 
                                                ? 'text-[#C2185B] fill-[#C2185B] drop-shadow-md' 
                                                : 'text-gray-500 group-hover:text-[#C2185B]'
                                        }`} 
                                    />
                                </motion.div>
                                
                                <AnimatePresence>
                                    {wishlist.length > 0 && (
                                        <motion.span
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-[#C2185B]/30 border-2 border-white"
                                        >
                                            {wishlist.length > 9 ? '9+' : wishlist.length}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>

                            {user && (
                                <Link
                                    to={"/cart"}
                                    className='relative group p-2.5 text-[#C2185B] hover:bg-[#FFF5F7] rounded-full transition-colors'
                                >
                                    <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                                    {cart.length > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className='absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md shadow-[#C2185B]/30 border-2 border-white'
                                        >
                                            {cart.length > 9 ? '9+' : cart.length}
                                        </motion.span>
                                    )}
                                </Link>
                            )}

                            {isAdmin && (
                                <Link
                                    className='hidden sm:flex bg-[#880E4F] hover:bg-[#C2185B] text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 items-center gap-2 shadow-md hover:shadow-lg'
                                    to={"/secret-dashboard"}
                                >
                                    <Lock size={16} />
                                    <span>Dashboard</span>
                                </Link>
                            )}

                            {/* USER PROFILE SECTION - FIXED */}
                            {user ? (
                                <div className="relative">
                                    <button
                                        ref={profileBtnRef}
                                        onClick={() => setProfileDropdown(!profileDropdown)}
                                        className="profile-btn flex items-center gap-2 bg-[#FFF5F7] px-3 py-2 rounded-full border border-[#F8BBD9] hover:border-[#C2185B] transition-all"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-[#880E4F]">{user.name?.split(' ')[0]}</span>
                                        <motion.div
                                            animate={{ rotate: profileDropdown ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#C2185B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </motion.div>
                                    </button>

                                    {/* Profile Dropdown - FIXED POSITIONING */}
                                    <AnimatePresence>
                                        {profileDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                style={{
                                                    position: 'fixed',
                                                    top: dropdownPos.top,
                                                    right: dropdownPos.right,
                                                    zIndex: 2147483647,
                                                }}
                                                className="w-64 bg-white rounded-2xl shadow-xl shadow-[#C2185B]/20 border border-[#F8BBD9] overflow-hidden"
                                            >
                                                {/* User Info Header */}
                                                <div className="p-4 bg-[#FFF5F7] border-b border-[#F8BBD9]/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-full flex items-center justify-center text-white font-bold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#880E4F] text-sm">{user.name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="p-2">
                                                    <Link 
                                                        to="/profile"
                                                        onClick={() => setProfileDropdown(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FFF5F7] text-[#2D2D2D] hover:text-[#C2185B] transition-colors"
                                                    >
                                                        <User size={18} />
                                                        <span className="text-sm font-medium">My Profile</span>
                                                    </Link>
                                                    <Link 
                                                        to="/orders"
                                                        onClick={() => setProfileDropdown(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FFF5F7] text-[#2D2D2D] hover:text-[#C2185B] transition-colors"
                                                    >
                                                        <ShoppingCart size={18} />
                                                        <span className="text-sm font-medium">My Orders</span>
                                                    </Link>
                                                    <Link 
                                                        to="/wishlist"
                                                        onClick={() => setProfileDropdown(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FFF5F7] text-[#2D2D2D] hover:text-[#C2185B] transition-colors"
                                                    >
                                                        <Heart size={18} className={wishlist.length > 0 ? "text-[#C2185B] fill-[#C2185B]" : ""} />
                                                        <span className="text-sm font-medium flex items-center gap-2">
                                                            Wishlist
                                                            {wishlist.length > 0 && (
                                                                <span className="bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                                    {wishlist.length}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </Link>
                                                    
                                                    <div className="border-t border-[#F8BBD9]/30 my-2" />
                                                    
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setProfileDropdown(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                                                    >
                                                        <LogOut size={18} />
                                                        <span className="text-sm font-medium">Logout</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={"/login"}
                                        className='hidden sm:flex items-center gap-2 text-[#C2185B] hover:text-[#880E4F] px-4 py-2 rounded-full hover:bg-[#FFF5F7] transition-all text-sm font-medium'
                                    >
                                        <LogIn size={18} />
                                        Login
                                    </Link>
                                    <Link
                                        to={"/signup"}
                                        className='bg-[#C2185B] hover:bg-[#880E4F] text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2'
                                    >
                                        <UserPlus size={18} />
                                        <span className="hidden sm:inline">Sign Up</span>
                                    </Link>
                                </div>
                            )}

                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-[#C2185B] hover:bg-[#FFF5F7] rounded-full transition-colors"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* ====== MOBILE SEARCH (FUNCTIONAL) ====== */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="md:hidden mt-3 pb-3"
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const searchInput = e.target.search.value;
                                    if (searchInput.trim()) {
                                        window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
                                        setSearchOpen(false);
                                    }
                                }}>
                                    <div className="relative">
                                        <input 
                                            name="search"
                                            type="text" 
                                            placeholder="Search..."
                                            className="w-full bg-[#FFF5F7] border-2 border-[#F8BBD9] rounded-full py-2 pl-10 pr-20 text-sm focus:outline-none focus:border-[#C2185B]"
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" size={18} />
                                        <button 
                                            type="submit"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C2185B] text-white px-4 py-1 rounded-full text-xs font-medium"
                                        >
                                            Go
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[100] bg-white lg:hidden"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-[#C2185B]">Menu</h2>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#C2185B]">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            {/* Mobile User Info */}
                            {user && (
                                <div className="flex items-center gap-4 mb-6 p-4 bg-[#FFF5F7] rounded-2xl">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-full flex items-center justify-center text-white text-xl font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#880E4F]">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <nav className="space-y-2">
                                <Link to="/" className="block text-lg text-[#2D2D2D] hover:text-[#C2185B] py-3 px-4 rounded-xl hover:bg-[#FFF5F7]">Home</Link>
                                <Link to="/category/electronics" className="block text-lg text-[#2D2D2D] hover:text-[#C2185B] py-3 px-4 rounded-xl hover:bg-[#FFF5F7]">Categories</Link>
                                
                                {user && (
                                    <>
                                        <Link to="/profile" className="block text-lg text-[#2D2D2D] hover:text-[#C2185B] py-3 px-4 rounded-xl hover:bg-[#FFF5F7]">My Profile</Link>
                                        <Link to="/orders" className="block text-lg text-[#2D2D2D] hover:text-[#C2185B] py-3 px-4 rounded-xl hover:bg-[#FFF5F7]">My Orders</Link>
                                        <Link to="/cart" className="block text-lg text-[#2D2D2D] hover:text-[#C2185B] py-3 px-4 rounded-xl hover:bg-[#FFF5F7]">Cart ({cart.length})</Link>
                                    </>
                                )}
                                
                                {isAdmin && (
                                    <Link to="/secret-dashboard" className="block text-lg text-[#C2185B] py-3 px-4 rounded-xl hover:bg-[#FFF5F7]">Admin Dashboard</Link>
                                )}
                                
                                {user ? (
                                    <button onClick={logout} className="w-full text-left block text-lg text-red-500 py-3 px-4 rounded-xl hover:bg-red-50">Logout</button>
                                ) : (
                                    <div className="space-y-3 pt-4">
                                        <Link to="/login" className="block w-full text-center bg-[#FFF5F7] text-[#C2185B] py-3 rounded-xl font-medium">Login</Link>
                                        <Link to="/signup" className="block w-full text-center bg-[#C2185B] text-white py-3 rounded-xl font-medium">Sign Up</Link>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;