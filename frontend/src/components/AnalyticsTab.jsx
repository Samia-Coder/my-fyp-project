import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";
import { 
    Users, Package, ShoppingCart, DollarSign, TrendingUp, 
    Activity, ArrowUpRight, Sparkles, Zap, BarChart3 
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";

// ============================================
// CUSTOM HOOKS
// ============================================

const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );
        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;
        let startTime;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return { count, ref: countRef };
};

// ============================================
// PARTICLE BACKGROUND COMPONENT
// ============================================

const ParticleBackground = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
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
// 3D TILT CARD COMPONENT
// ============================================

const TiltCard = ({ children, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AnalyticsTab = () => {
    const [analyticsData, setAnalyticsData] = useState({
        users: 12543,
        products: 892,
        totalSales: 3456,
        totalRevenue: 98765,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [dailySalesData, setDailySalesData] = useState([]);
    const [activeChart, setActiveChart] = useState('area');
    const [hoveredCard, setHoveredCard] = useState(null);

    // Demo data for charts
    const demoData = [
        { date: 'Mon', sales: 120, revenue: 3400, orders: 45 },
        { date: 'Tue', sales: 180, revenue: 5200, orders: 62 },
        { date: 'Wed', sales: 150, revenue: 4100, orders: 51 },
        { date: 'Thu', sales: 220, revenue: 6800, orders: 78 },
        { date: 'Fri', sales: 280, revenue: 8900, orders: 95 },
        { date: 'Sat', sales: 320, revenue: 10200, orders: 112 },
        { date: 'Sun', sales: 260, revenue: 7600, orders: 88 },
    ];

    const categoryData = [
        { name: 'Electronics', value: 35, color: '#C2185B' },
        { name: 'Fashion', value: 25, color: '#E91E63' },
        { name: 'Home', value: 20, color: '#F06292' },
        { name: 'Sports', value: 15, color: '#F8BBD9' },
        { name: 'Other', value: 5, color: '#880E4F' },
    ];

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await axios.get("/analytics");
                setAnalyticsData(response.data.analyticsData);
                setDailySalesData(response.data.dailySalesData);
            } catch (error) {
                console.error("Error fetching analytics data:", error);
                setDailySalesData(demoData);
            } finally {
                setTimeout(() => setIsLoading(false), 1500);
            }
        };
        fetchAnalyticsData();
    }, []);

    // Animated counters
    const usersCounter = useCountUp(analyticsData.users);
    const productsCounter = useCountUp(analyticsData.products);
    const salesCounter = useCountUp(analyticsData.totalSales);
    const revenueCounter = useCountUp(analyticsData.totalRevenue);

    const cardData = [
        { 
            title: 'Total Users', 
            value: usersCounter.count, 
            icon: Users, 
            gradient: 'from-[#C2185B] via-[#D81B60] to-[#E91E63]', 
            glow: 'shadow-[#C2185B]/20',
            trend: '+12.5%',
            subtitle: 'Active this month'
        },
        { 
            title: 'Total Products', 
            value: productsCounter.count, 
            icon: Package, 
            gradient: 'from-[#E91E63] via-[#EC407A] to-[#F06292]', 
            glow: 'shadow-[#E91E63]/20',
            trend: '+8.2%',
            subtitle: 'In inventory'
        },
        { 
            title: 'Total Sales', 
            value: salesCounter.count, 
            icon: ShoppingCart, 
            gradient: 'from-[#880E4F] via-[#AD1457] to-[#C2185B]', 
            glow: 'shadow-[#880E4F]/20',
            trend: '+23.1%',
            subtitle: 'This week'
        },
        { 
            title: 'Total Revenue', 
            value: `$${revenueCounter.count.toLocaleString()}`, 
            icon: DollarSign, 
            gradient: 'from-[#AD1457] via-[#C2185B] to-[#D81B60]', 
            glow: 'shadow-[#AD1457]/20',
            trend: '+18.7%',
            subtitle: 'Net profit'
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center relative overflow-hidden">
                <ParticleBackground />
                <motion.div
                    className="relative z-10 flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                        <span className="text-[#C2185B] font-semibold text-lg tracking-wide">Loading Analytics...</span>
                        <Sparkles className="w-5 h-5 text-[#C2185B]" />
                    </motion.div>
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
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <motion.div 
                                className="p-3 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-2xl shadow-lg shadow-[#C2185B]/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Activity className="w-8 h-8 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-4xl font-black text-[#880E4F] tracking-tight">
                                    Analytics Dashboard
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <p className="text-[#C2185B] opacity-60 font-medium">Live data • Updated just now</p>
                                </div>
                            </div>
                        </div>
                        
                        <motion.div 
                            className="flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-2xl p-2 border border-[#F8BBD9]/50"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <button 
                                onClick={() => setActiveChart('area')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeChart === 'area' ? 'bg-[#C2185B] text-white shadow-lg shadow-[#C2185B]/30' : 'text-[#C2185B] hover:bg-[#FCE4EC]'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveChart('bar')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeChart === 'bar' ? 'bg-[#C2185B] text-white shadow-lg shadow-[#C2185B]/30' : 'text-[#C2185B] hover:bg-[#FCE4EC]'}`}
                            >
                                Detailed
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cardData.map((card, index) => (
                        <TiltCard key={card.title}>
                            <motion.div
                                ref={index === 0 ? usersCounter.ref : index === 1 ? productsCounter.ref : index === 2 ? salesCounter.ref : revenueCounter.ref}
                                className={`relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-[#F8BBD9]/40 shadow-lg ${card.glow} group cursor-pointer`}
                                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.15, type: "spring" }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                onHoverStart={() => setHoveredCard(index)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                {/* Glow effect on hover */}
                                <AnimatePresence>
                                    {hoveredCard === index && (
                                        <motion.div
                                            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.05 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <motion.div 
                                            className="flex items-center gap-1 bg-[#FCE4EC] px-3 py-1 rounded-full"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <ArrowUpRight className="w-3 h-3 text-[#C2185B]" />
                                            <span className="text-xs font-bold text-[#C2185B]">{card.trend}</span>
                                        </motion.div>
                                    </div>
                                    
                                    <p className="text-[#C2185B] text-sm font-medium opacity-70 mb-1">{card.title}</p>
                                    <h3 className="text-[#880E4F] text-3xl font-black tracking-tight mb-1">
                                        {card.value.toLocaleString()}
                                    </h3>
                                    <p className="text-xs text-[#C2185B] opacity-50 font-medium">{card.subtitle}</p>
                                </div>

                                {/* Bottom gradient line */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient}`} />
                                
                                {/* Decorative icon */}
                                <motion.div 
                                    className="absolute -bottom-6 -right-6 text-[#F8BBD9] opacity-20"
                                    animate={{ rotate: hoveredCard === index ? 15 : 0, scale: hoveredCard === index ? 1.2 : 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <card.icon className="w-32 h-32" />
                                </motion.div>
                            </motion.div>
                        </TiltCard>
                    ))}
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* MAIN CHART */}
                    <motion.div
                        className="lg:col-span-2 rounded-3xl bg-white/70 backdrop-blur-xl p-8 border border-[#F8BBD9]/40 shadow-lg"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#880E4F] flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-[#E91E63]" />
                                    Performance Analytics
                                </h2>
                                <p className="text-sm text-[#C2185B] opacity-50 mt-1 font-medium">Real-time sales & revenue tracking</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="flex items-center gap-2 text-xs font-bold text-white bg-[#C2185B] px-4 py-2 rounded-xl shadow-lg shadow-[#C2185B]/30">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Sales
                                </span>
                                <span className="flex items-center gap-2 text-xs font-bold text-[#E91E63] bg-[#FCE4EC] px-4 py-2 rounded-xl">
                                    <span className="w-2 h-2 rounded-full bg-[#E91E63]" /> Revenue
                                </span>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={420}>
                            {activeChart === 'area' ? (
                                <AreaChart data={dailySalesData.length ? dailySalesData : demoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C2185B" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#C2185B" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E91E63" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD9" opacity={0.2} />
                                    <XAxis dataKey="date" stroke="#C2185B" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} />
                                    <YAxis yAxisId="left" stroke="#C2185B" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#E91E63" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 245, 247, 0.95)', 
                                            border: '2px solid #F8BBD9',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 25px -5px rgba(194, 24, 91, 0.15)',
                                            padding: '16px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        labelStyle={{ color: '#880E4F', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}
                                        itemStyle={{ fontWeight: 600, fontSize: '13px' }}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#C2185B" strokeWidth={4} fill="url(#salesGrad)" name="Sales" />
                                    <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#E91E63" strokeWidth={4} fill="url(#revGrad)" name="Revenue" />
                                </AreaChart>
                            ) : (
                                <BarChart data={dailySalesData.length ? dailySalesData : demoData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD9" opacity={0.2} />
                                    <XAxis dataKey="date" stroke="#C2185B" tickLine={false} axisLine={false} fontWeight={600} />
                                    <YAxis stroke="#C2185B" tickLine={false} axisLine={false} fontWeight={600} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 245, 247, 0.95)', 
                                            border: '2px solid #F8BBD9',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 25px -5px rgba(194, 24, 91, 0.15)'
                                        }}
                                    />
                                    <Bar dataKey="sales" fill="#C2185B" radius={[8, 8, 0, 0]} name="Sales" />
                                    <Bar dataKey="revenue" fill="#E91E63" radius={[8, 8, 0, 0]} name="Revenue" opacity={0.8} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </motion.div>

                    {/* SIDE PANEL */}
                    <div className="space-y-6">
                        {/* Category Distribution */}
                        <motion.div
                            className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-[#F8BBD9]/40 shadow-lg"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            <h3 className="text-lg font-black text-[#880E4F] mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[#E91E63]" />
                                Category Split
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '12px', 
                                            border: '2px solid #F8BBD9',
                                            backgroundColor: 'rgba(255, 245, 247, 0.95)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {categoryData.map((cat) => (
                                    <div key={cat.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs font-semibold text-[#880E4F]">{cat.name} {cat.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            className="rounded-3xl bg-gradient-to-br from-[#C2185B] to-[#E91E63] p-6 shadow-xl shadow-[#C2185B]/20 text-white"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Key Metrics
                            </h3>
                            <div className="space-y-5">
                                <MetricItem label="Avg. Order Value" value={`$${(analyticsData.totalRevenue / (analyticsData.totalSales || 1)).toFixed(2)}`} />
                                <MetricItem label="Conversion Rate" value="3.2%" />
                                <MetricItem label="Customer Retention" value="68%" />
                                <MetricItem label="Growth Rate" value="+24.5%" highlight />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* BOTTOM STATS ROW */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                >
                    <BottomCard 
                        title="Top Product" 
                        value="Wireless Earbuds Pro" 
                        subtitle="1,234 sold this month"
                        icon={Package}
                        gradient="from-[#FCE4EC] to-[#F8BBD9]/30"
                    />
                    <BottomCard 
                        title="Peak Hour" 
                        value="2:00 PM - 4:00 PM" 
                        subtitle="Highest traffic window"
                        icon={Activity}
                        gradient="from-[#F8BBD9]/30 to-[#FCE4EC]"
                    />
                    <BottomCard 
                        title="Active Now" 
                        value="142" 
                        subtitle="Users currently browsing"
                        icon={Users}
                        gradient="from-[#FCE4EC] to-[#F8BBD9]/30"
                        live
                    />
                </motion.div>
            </div>
        </div>
    );
};

// ============================================
// SUB COMPONENTS
// ============================================

const MetricItem = ({ label, value, highlight }) => (
    <div className="flex items-center justify-between">
        <span className="text-white/80 text-sm font-medium">{label}</span>
        <span className={`font-black text-lg ${highlight ? 'text-[#F8BBD9]' : 'text-white'}`}>{value}</span>
    </div>
);

const BottomCard = ({ title, value, subtitle, icon: Icon, gradient, live }) => (
    <motion.div
        className={`rounded-3xl bg-gradient-to-br ${gradient} p-6 border border-[#F8BBD9]/30 backdrop-blur-sm`}
        whileHover={{ y: -3, scale: 1.02 }}
    >
        <div className="flex items-center justify-between mb-3">
            <span className="text-[#880E4F] font-semibold text-sm">{title}</span>
            <div className="p-2 bg-white/50 rounded-xl">
                <Icon className="w-4 h-4 text-[#C2185B]" />
            </div>
        </div>
        <h4 className="text-[#880E4F] text-xl font-black mb-1 flex items-center gap-2">
            {value}
            {live && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
        </h4>
        <p className="text-[#C2185B] text-xs opacity-60 font-medium">{subtitle}</p>
    </motion.div>
);

export default AnalyticsTab;