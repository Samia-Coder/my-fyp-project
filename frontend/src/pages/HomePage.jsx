import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import FeaturedProducts from "../components/FeaturedProducts";
import ImageComponent from "../components/ImageComponent"; // ✅ NEW
import { 
    ArrowRight, Sparkles, TrendingUp, Clock, Percent, ChevronLeft, ChevronRight, Star,
    ShoppingBag, Zap, Shield, Truck, Heart, Eye, ArrowUpRight, Gift, Flame, BadgeCheck,
    Diamond, Crown, Gem
} from "lucide-react";

const HomePage = () => {
    const { fetchFeaturedProducts, products, loading } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const heroSlides = [
        {
            image: "/image/hero-banner1.jpg",
            title: "Shop the Best Deals",
            subtitle: "Discover amazing products at unbeatable prices",
            cta: "Shop Now",
            link: "/category/electronics",
            badge: "New Collection"
        },
        {
            image: "/image/hero-banner2.jpg",
            title: "Summer Sale 2026",
            subtitle: "Up to 50% off on selected items",
            cta: "View Deals",
            link: "/deals",
            badge: "Hot Sale"
        },
        {
            image: "/image/hero-banner3.jpg",
            title: "Premium Fashion",
            subtitle: "Elevate your style with our exclusive collection",
            cta: "Explore",
            link: "/category/fashion",
            badge: "Trending"
        }
    ];

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setMousePosition({
                x: (e.clientX - rect.left - rect.width / 2) / 50,
                y: (e.clientY - rect.top - rect.height / 2) / 50
            });
        }
    };

    useEffect(() => {
        fetchFeaturedProducts();
        fetchCategories();
    }, [fetchFeaturedProducts, fetchCategories]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    const FloatingParticles = () => {
        const particles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 6 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 5
        }));

        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-white/20"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.random() * 40 - 20, 0],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        );
    };

    const Marquee = () => {
        const items = ["Free Shipping", "24/7 Support", "Easy Returns", "Secure Payment", "Best Prices", "New Arrivals Daily", "Premium Quality", "Fast Delivery"];
        return (
            <div className="relative overflow-hidden py-3 bg-gradient-to-r from-brand-primary via-brand-light to-brand-primary">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-brand-primary to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-brand-primary to-transparent z-10" />
                <motion.div 
                    className="flex gap-12 whitespace-nowrap"
                    animate={{ x: [0, -1500] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                    {[...items, ...items, ...items, ...items].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            <span className="text-xs font-medium text-white/90 tracking-wider uppercase">{item}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        );
    };

    const FlashSaleTimer = () => {
        const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 });

        useEffect(() => {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                    if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                    if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                    return { hours: 23, minutes: 59, seconds: 59 };
                });
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        const TimeBox = ({ value, label }) => (
            <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-brand-primary font-bold text-xl shadow-md border border-brand-accent/30">
                    {String(value).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-white/80 mt-1 font-medium uppercase">{label}</span>
            </div>
        );

        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flame className="text-brand-accent" size={20} />
                        <h3 className="text-lg font-bold text-white">Flash Sale</h3>
                    </div>
                    <span className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full">Limited Time</span>
                </div>
                <div className="flex items-center gap-3 justify-center">
                    <TimeBox value={timeLeft.hours} label="Hours" />
                    <span className="text-2xl font-bold text-white mb-4">:</span>
                    <TimeBox value={timeLeft.minutes} label="Mins" />
                    <span className="text-2xl font-bold text-white mb-4">:</span>
                    <TimeBox value={timeLeft.seconds} label="Secs" />
                </div>
            </div>
        );
    };

    const GlassCard = ({ children, className = "", hoverEffect = true }) => (
        <motion.div 
            className={`relative group ${className}`}
            whileHover={hoverEffect ? { y: -5 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="relative bg-white rounded-2xl shadow-md border border-brand-accent/20 overflow-hidden hover:shadow-xl hover:border-brand-accent/40 transition-all duration-300">
                {children}
            </div>
        </motion.div>
    );

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen overflow-hidden bg-brand-bg"
        >
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div 
                className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent via-brand-primary to-brand-dark origin-left z-50"
                style={{ scaleX }}
            />

            {/* Hero Slider */}
            <div className="relative h-[500px] md:h-[600px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <ImageComponent 
                            src={heroSlides[currentSlide].image} 
                            alt="Hero" 
                            className="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-brand-dark/30 to-transparent" />
                        <FloatingParticles />
                    </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={`badge-${currentSlide}`}
                                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 text-sm"
                            >
                                <Sparkles size={14} className="text-brand-accent" />
                                {heroSlides[currentSlide].badge}
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                key={`title-${currentSlide}`}
                                className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
                            >
                                {heroSlides[currentSlide].title}
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                key={`sub-${currentSlide}`}
                                className="text-lg text-white/90 mb-8"
                            >
                                {heroSlides[currentSlide].subtitle}
                            </motion.p>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                key={`cta-${currentSlide}`}
                            >
                                <Link 
                                    to={heroSlides[currentSlide].link}
                                    className="inline-flex items-center gap-2 bg-white text-brand-primary px-8 py-3 rounded-full font-semibold hover:bg-brand-bg transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
                                >
                                    {heroSlides[currentSlide].cta}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <button onClick={prevSlide} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex gap-2">
                        {heroSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 rounded-full transition-all ${idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                            />
                        ))}
                    </div>
                    <button onClick={nextSlide} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <Marquee />

            {/* Stats Banner */}
            <div className="bg-white py-8 border-b border-brand-accent/10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Star, value: "50K+", label: "Happy Customers", color: "text-brand-primary" },
                            { icon: TrendingUp, value: "10K+", label: "Products", color: "text-brand-light" },
                            { icon: Percent, value: "24/7", label: "Support", color: "text-brand-primary" },
                            { icon: Clock, value: "2-Day", label: "Delivery", color: "text-brand-light" },
                        ].map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3 text-center flex-col"
                            >
                                <stat.icon size={28} className={stat.color} />
                                <div>
                                    <p className="text-xl font-bold text-brand-dark">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Flash Sale Section */}
            <div className="py-16 relative overflow-hidden bg-gradient-to-br from-brand-dark to-brand-primary">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm mb-4">
                                <Zap size={16} className="text-brand-accent" />
                                <span>Limited Offer</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                Don't Miss Out!<br />
                                <span className="text-brand-accent">Up to 70% Off</span>
                            </h2>
                            <p className="text-white/80 text-lg mb-6 max-w-md">
                                Grab the hottest deals before they expire. Exclusive discounts on premium products!
                            </p>
                            <Link 
                                to="/deals"
                                className="inline-flex items-center gap-2 bg-white text-brand-primary px-8 py-3 rounded-full font-semibold hover:bg-brand-bg transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
                            >
                                <Zap size={18} />
                                Shop Deals Now
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full md:w-auto"
                        >
                            <FlashSaleTimer />
                        </motion.div>
                    </div>
                </div>
            </div>

           {/* Categories Section */}
<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div className="text-center mb-12">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <span className="inline-flex items-center gap-2 bg-brand-bg text-brand-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-brand-accent/30">
                <Sparkles size={16} />
                Browse Collection
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-brand-dark mb-4">Shop by Category</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Explore our wide range of premium categories</p>
        </motion.div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => {
            const categoryImageMap = {
                'electronics': '/image/electronics.jpg',
                'fashion': '/image/fashion.jpg',
                'home & living': '/image/home-living.jpg',
                'beauty & health': '/image/beauty-health.jpg',
                'sports & outdoor': '/image/sports.jpg',
                'books & stationery': '/image/books.jpg',
            };

            const slug = category.slug?.toLowerCase() || '';
            const name = category.name?.toLowerCase() || '';
            
            let imageUrl = category.image;
            
            if (!imageUrl || imageUrl.trim() === "" || imageUrl === "null" || imageUrl === "undefined") {
                imageUrl = categoryImageMap[slug] || categoryImageMap[name] || '/image/electronics.jpg';
            }
            
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/image/')) {
    imageUrl = `/image/${imageUrl}`;
}

            const itemCount = category.subcategories?.length || 0;

            return (
                <motion.div 
                    key={category.slug || index} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Link to={`/category/${category.slug}`} className="group block">
                        {/* FIXED CARD - No conflicting animations */}
                        <div className="relative bg-white rounded-2xl shadow-md border border-brand-accent/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-accent/40 hover:-translate-y-1">
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <div className="h-3/5 w-full relative overflow-hidden">
                                    <ImageComponent 
                                        src={imageUrl}
                                        alt={category.name}
                                        className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
                                    />
                                    
                                    {/* FIXED OVERLAY - Smooth fade without blink */}
                                    <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/30 transition-all duration-300 flex items-center justify-center">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-md hover:scale-110 transition-transform">
                                                <Eye size={18} />
                                            </div>
                                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                                                <Heart size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-brand-primary">
                                        {itemCount} items
                                    </div>
                                </div>
                                
                                <div className="p-4 text-center h-2/5 flex flex-col justify-center bg-white">
                                    <h3 className="text-base font-bold text-brand-dark group-hover:text-brand-primary transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                    <div className="mt-2 inline-flex items-center justify-center gap-1 text-brand-primary text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <span>Explore</span>
                                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            );
        })}
    </div>
</div>

            {/* Featured Products */}
            {!loading && products.length > 0 && (
                <div className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="inline-flex items-center gap-2 bg-brand-bg text-brand-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                                    <TrendingUp size={16} />
                                    Trending Now
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-brand-dark mb-4">Featured Products</h2>
                                <p className="text-gray-500">Handpicked premium products just for you</p>
                            </motion.div>
                        </div>
                        <FeaturedProducts featuredProducts={products} />
                    </div>
                </div>
            )}

            {/* New Arrivals Banner */}
            <div className="py-20 relative overflow-hidden bg-gradient-to-br from-brand-bg to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1 text-center md:text-left"
                        >
                            <span className="inline-flex items-center gap-2 bg-brand-bg text-brand-primary px-4 py-2 rounded-full text-sm mb-4 border border-brand-accent/30">
                                <Gift size={16} />
                                New Arrivals
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 leading-tight">
                                Summer Collection<br />
                                <span className="text-brand-primary">2026</span>
                            </h2>
                            <p className="text-gray-500 text-lg mb-6 max-w-md">
                                Discover the latest trends and styles. Fresh arrivals every week!
                            </p>
                            <Link 
                                to="/new-arrivals"
                                className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-dark transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
                            >
                                Explore Now
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex gap-3 flex-wrap justify-center"
                        >
                            {[
                                { icon: Truck, title: "Free", subtitle: "Shipping" },
                                { icon: Shield, title: "100%", subtitle: "Secure" },
                                { icon: BadgeCheck, title: "Top", subtitle: "Quality" },
                                { icon: Crown, title: "VIP", subtitle: "Access" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="w-24 h-32 bg-white rounded-2xl p-3 text-center border border-brand-accent/20 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <item.icon className="text-brand-primary" size={24} />
                                    <p className="text-brand-dark font-bold text-sm">{item.title}</p>
                                    <p className="text-gray-400 text-[10px]">{item.subtitle}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Promo Banner */}
            <div className="py-20 bg-gradient-to-r from-brand-dark to-brand-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Gift size={28} className="text-white" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Sign Up & Get 10% Off</h2>
                            <p className="text-white/80 text-lg mb-2">Join our newsletter and get exclusive deals</p>
                            <p className="text-brand-accent text-sm mb-8">+ Free shipping on your first order</p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email"
                                    className="flex-1 px-6 py-3 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/50"
                                />
                                <button className="px-8 py-3 bg-white text-brand-primary rounded-full font-bold hover:bg-brand-bg transition-all shadow-lg hover:scale-105">
                                    Subscribe
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Why Choose Us</h2>
                        <p className="text-gray-500">We provide the best shopping experience</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "🚀", title: "Fast Delivery", desc: "Get your products delivered within 2-3 business days with real-time tracking" },
                            { icon: "🛡️", title: "Secure Shopping", desc: "Your data is protected with 256-bit SSL encryption and secure payment gateways" },
                            { icon: "💎", title: "Quality Guarantee", desc: "All products are verified for quality assurance with 30-day return policy" },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="text-center p-8 bg-brand-bg/50 rounded-2xl border border-brand-accent/20 hover:border-brand-accent/40 hover:shadow-lg transition-all"
                            >
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="text-xl font-bold text-brand-dark mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-20 bg-brand-bg/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 bg-white text-brand-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-brand-accent/30">
                            <Star size={16} className="fill-brand-primary" />
                            Testimonials
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">What Our Customers Say</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Johnson", role: "Fashion Enthusiast", text: "Absolutely love the quality! The website design itself shows how premium the brand is.", rating: 5 },
                            { name: "Michael Chen", role: "Tech Geek", text: "Fast delivery and amazing customer support. The products exceeded my expectations!", rating: 5 },
                            { name: "Emma Williams", role: "Interior Designer", text: "The home collection is stunning. Every piece I ordered was exactly as described!", rating: 5 }
                        ].map((review, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-white p-6 rounded-2xl border border-brand-accent/20 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-brand-primary text-brand-primary" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">"{review.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                                        {review.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-brand-dark text-sm">{review.name}</p>
                                        <p className="text-xs text-gray-400">{review.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter Floating Bar */}
            <motion.div 
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-accent/20 p-3 z-40 shadow-lg"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 2, type: "spring" }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-accent to-brand-primary rounded-lg flex items-center justify-center">
                            <Gift size={16} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-brand-dark">Get 15% off your first order!</p>
                            <p className="text-[10px] text-gray-500">Subscribe to our newsletter</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            placeholder="Your email"
                            className="px-3 py-2 rounded-full bg-brand-bg border border-brand-accent/30 text-sm w-32 sm:w-48 focus:outline-none focus:border-brand-primary"
                        />
                        <button className="px-4 py-2 bg-brand-primary text-white rounded-full text-sm font-medium hover:bg-brand-dark transition-colors">
                            Join
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;