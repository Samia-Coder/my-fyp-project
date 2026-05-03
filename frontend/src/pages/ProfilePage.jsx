import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
    User, Mail, Phone, MapPin, Calendar, ShoppingBag, 
    Heart, Star, Edit2, Save, X, Camera, LogOut,
    Package, CreditCard, Settings, ChevronRight,
    Shield, Bell, Truck, Clock, CheckCircle,
    ArrowLeft, MapPinHouse, Wallet
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { user, logout, updateProfile, orders, fetchOrders } = useUserStore();
    const { cart } = useCartStore();
    const { wishlist } = useWishlistStore();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState("profile");
    
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        bio: "",
        avatar: ""
    });

    // Fetch orders on mount
    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    // Update profileData when user changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                city: user.city || "",
                country: user.country || "",
                bio: user.bio || "",
                avatar: user.avatar || ""
            });
        }
    }, [user]);

    // REAL STATS from actual data
    const stats = [
        { 
            icon: ShoppingBag, 
            label: "Orders", 
            value: orders.length.toString(), 
            color: "from-[#C2185B] to-[#E91E63]",
            onClick: () => setActiveSection("orders")
        },
        { 
            icon: Heart, 
            label: "Wishlist", 
            value: wishlist.length.toString(), 
            color: "from-[#E91E63] to-[#F06292]",
            onClick: () => navigate("/wishlist")
        },
        { 
            icon: Star, 
            label: "Reviews", 
            value: "0", 
            color: "from-[#880E4F] to-[#C2185B]",
            onClick: () => setActiveSection("reviews")
        },
        { 
            icon: Package, 
            label: "Delivered", 
            value: orders.filter(o => o.orderStatus === "delivered").length.toString(), 
            color: "from-[#AD1457] to-[#D81B60]",
            onClick: () => setActiveSection("orders")
        },
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "safira_mart");

        try {
            toast.loading("Uploading image...");
            
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/dk7c6kwvi/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            
            const data = await response.json();
            
            if (data.secure_url) {
                setProfileData({ ...profileData, avatar: data.secure_url });
                toast.dismiss();
                toast.success("Image uploaded! Click Save to update profile.");
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to upload image");
            console.error(error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile(profileData);
            setIsEditing(false);
        } catch (error) {
            console.error("Update error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "delivered": return "bg-green-100 text-green-700 border-green-200";
            case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
            case "processing": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "placed": return "bg-purple-100 text-purple-700 border-purple-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case "delivered": return <CheckCircle size={14} />;
            case "shipped": return <Truck size={14} />;
            case "processing": return <Clock size={14} />;
            case "placed": return <Package size={14} />;
            case "cancelled": return <X size={14} />;
            default: return <Package size={14} />;
        }
    };

    const menuItems = [
        { icon: Package, label: "My Orders", id: "orders", desc: "View your order history" },
        { icon: Heart, label: "Wishlist", id: "wishlist", desc: "Your saved items" },
        { icon: Star, label: "Reviews", id: "reviews", desc: "Product reviews" },
        { icon: Settings, label: "Settings", id: "settings", desc: "Account preferences" },
    ];

    const particles = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
    }));

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-[#880E4F] font-bold mb-4">Please login to view your profile</p>
                    <Link to="/login" className="px-6 py-3 bg-[#C2185B] text-white rounded-xl font-bold">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-[#E91E63]"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, filter: 'blur(1px)' }}
                        animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            <div className="relative z-10 pt-20 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Profile Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-[#C2185B]/10 border border-[#F8BBD9]/40 overflow-hidden mb-8"
                    >
                        <div className="h-56 bg-gradient-to-r from-[#880E4F] via-[#C2185B] to-[#E91E63] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20" 
                                 style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }} 
                            />
                        </div>

                        <div className="px-8 pb-8 relative">
                           <div className="relative -mt-20 mb-6 inline-block">
                                <motion.div 
                                    className="w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white" 
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {profileData.avatar ? (
                                        <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#C2185B] to-[#E91E63] flex items-center justify-center text-white text-5xl font-black">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </motion.div>
                                
                                <button 
                                    type="button"
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-[#C2185B] to-[#E91E63] rounded-full flex items-center justify-center text-white shadow-lg z-10 cursor-pointer hover:from-[#880E4F] hover:to-[#C2185B] transition-all"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <Camera size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-[#880E4F]">{user?.name || "User"}</h1>
                                    <div className="flex items-center gap-2 mt-2 text-[#C2185B] opacity-70">
                                        <Mail size={16} />
                                        <span className="font-medium">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Active
                                        </span>
                                        {user?.role === "admin" && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FCE4EC] text-[#C2185B] rounded-full text-xs font-bold border border-[#F8BBD9]">
                                                <Shield size={12} />
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    {isEditing ? (
                                        <>
                                            <motion.button 
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold"
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <X size={18} /> Cancel
                                            </motion.button>
                                            <motion.button 
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl shadow-lg font-semibold disabled:opacity-50"
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isLoading ? <Clock size={18} className="animate-spin" /> : <Save size={18} />}
                                                Save
                                            </motion.button>
                                        </>
                                    ) : (
                                        <motion.button 
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#FFF5F7] text-[#C2185B] border-2 border-[#F8BBD9] rounded-xl font-semibold"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Edit2 size={18} /> Edit Profile
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats - NOW CLICKABLE */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg cursor-pointer"
                                onClick={stat.onClick}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg`}>
                                    <stat.icon size={24} />
                                </div>
                                <p className="text-2xl font-black text-[#880E4F]">{stat.value}</p>
                                <p className="text-sm text-[#C2185B] opacity-60 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <AnimatePresence mode="wait">
                                {/* PROFILE SECTION */}
                                {activeSection === "profile" && (
                                    <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        
                                        {/* Personal Info */}
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg mb-6">
                                            <h3 className="text-xl font-black text-[#880E4F] mb-6 flex items-center gap-2">
                                                <User size={22} className="text-[#C2185B]" />
                                                Personal Information
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {[
                                                    { label: "Full Name", key: "name", icon: User, type: "text" },
                                                    { label: "Email", key: "email", icon: Mail, type: "email" },
                                                    { label: "Phone", key: "phone", icon: Phone, type: "tel", placeholder: "+92 300 1234567" },
                                                    { label: "City", key: "city", icon: MapPin, type: "text" },
                                                ].map((field) => (
                                                    <div key={field.key}>
                                                        <label className="text-sm text-[#C2185B] opacity-70 mb-1.5 block font-semibold">{field.label}</label>
                                                        {isEditing ? (
                                                            <div className="relative">
                                                                <field.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B] opacity-50" />
                                                                <input 
                                                                    type={field.type}
                                                                    value={profileData[field.key]}
                                                                    onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                                                                    className="w-full pl-10 pr-4 py-3 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl focus:border-[#C2185B] focus:outline-none text-[#880E4F] font-medium"
                                                                    placeholder={field.placeholder}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 p-3 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/20">
                                                                <field.icon size={16} className="text-[#C2185B] opacity-60" />
                                                                <span className="text-[#2D2D2D] font-medium">{profileData[field.key] || "Not added"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-5">
                                                <label className="text-sm text-[#C2185B] opacity-70 mb-1.5 block font-semibold">Country</label>
                                                {isEditing ? (
                                                    <select 
                                                        value={profileData.country}
                                                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                                                        className="w-full p-3 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl focus:border-[#C2185B] focus:outline-none text-[#880E4F] font-medium"
                                                    >
                                                        <option value="">Select Country</option>
                                                        <option value="Pakistan">Pakistan</option>
                                                        <option value="USA">USA</option>
                                                        <option value="UK">UK</option>
                                                        <option value="UAE">UAE</option>
                                                        <option value="India">India</option>
                                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center gap-2 p-3 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/20">
                                                        <MapPin size={16} className="text-[#C2185B] opacity-60" />
                                                        <span className="text-[#2D2D2D] font-medium">{profileData.country || "Not added"}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-5">
                                                <label className="text-sm text-[#C2185B] opacity-70 mb-1.5 block font-semibold">Address</label>
                                                {isEditing ? (
                                                    <textarea 
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                                        className="w-full p-3 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl focus:border-[#C2185B] focus:outline-none text-[#880E4F] font-medium resize-none"
                                                        rows="2"
                                                        placeholder="Enter your complete address"
                                                    />
                                                ) : (
                                                    <div className="flex items-start gap-2 p-3 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/20">
                                                        <MapPinHouse size={16} className="text-[#C2185B] opacity-60 mt-1" />
                                                        <span className="text-[#2D2D2D] font-medium">{profileData.address || "No address added"}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-5">
                                                <label className="text-sm text-[#C2185B] opacity-70 mb-1.5 block font-semibold">Bio</label>
                                                {isEditing ? (
                                                    <textarea 
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                                        className="w-full p-3 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl focus:border-[#C2185B] focus:outline-none text-[#880E4F] font-medium resize-none"
                                                        rows="3"
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/20">
                                                        <p className="text-[#2D2D2D] font-medium italic">{profileData.bio || "No bio added yet"}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Orders - REAL DATA */}
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-black text-[#880E4F] flex items-center gap-2">
                                                    <Package size={22} className="text-[#C2185B]" />
                                                    Recent Orders
                                                </h3>
                                                {orders.length > 0 && (
                                                    <motion.button 
                                                        onClick={() => setActiveSection("orders")}
                                                        className="text-[#C2185B] text-sm font-bold flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-[#FCE4EC] transition-colors"
                                                        whileHover={{ x: 3 }}
                                                    >
                                                        View All <ChevronRight size={16} />
                                                    </motion.button>
                                                )}
                                            </div>
                                            
                                            {orders.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Package size={48} className="text-[#F8BBD9] mx-auto mb-3" />
                                                    <p className="text-[#880E4F] font-bold">No orders yet</p>
                                                    <p className="text-sm text-[#C2185B] opacity-60">Your order history will appear here</p>
                                                    <motion.button
                                                        onClick={() => navigate("/")}
                                                        className="mt-4 px-6 py-2 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-bold text-sm"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        Start Shopping
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {orders.slice(0, 3).map((order, idx) => (
                                                        <motion.div 
                                                            key={order._id || idx} 
                                                            className="flex items-center justify-between p-4 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/20 cursor-pointer"
                                                            whileHover={{ x: 5 }}
                                                            onClick={() => setActiveSection("orders")}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-xl flex items-center justify-center text-white">
                                                                    <Package size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[#880E4F]">#{order._id?.slice(-8).toUpperCase()}</p>
                                                                    <p className="text-xs text-[#C2185B] opacity-60">
                                                                        {new Date(order.createdAt).toLocaleDateString()} • {order.products?.length || 0} items
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-black text-[#880E4F]">${order.totalAmount?.toFixed(2)}</p>
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border inline-flex items-center gap-1 ${getStatusColor(order.orderStatus)}`}>
                                                                    {getStatusIcon(order.orderStatus)}
                                                                    {order.orderStatus}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ORDERS SECTION - REAL DATA */}
                                {activeSection === "orders" && (
                                    <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <motion.button 
                                                    onClick={() => setActiveSection("profile")}
                                                    className="p-2 hover:bg-[#FFF5F7] rounded-xl transition-colors"
                                                    whileHover={{ x: -3 }}
                                                >
                                                    <ArrowLeft size={20} className="text-[#C2185B]" />
                                                </motion.button>
                                                <h3 className="text-xl font-black text-[#880E4F]">My Orders ({orders.length})</h3>
                                            </div>
                                            
                                            {orders.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <Package size={64} className="text-[#F8BBD9] mx-auto mb-4" />
                                                    <p className="text-xl font-bold text-[#880E4F]">No orders yet</p>
                                                    <p className="text-[#C2185B] opacity-60 mt-2">You haven't placed any orders</p>
                                                    <motion.button
                                                        onClick={() => navigate("/")}
                                                        className="mt-6 px-8 py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-bold shadow-lg"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        Browse Products
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {orders.map((order, idx) => (
                                                        <motion.div 
                                                            key={order._id || idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="p-5 bg-[#FFF5F7] rounded-2xl border border-[#F8BBD9]/20"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <p className="font-black text-[#880E4F] text-lg">#{order._id?.slice(-8).toUpperCase()}</p>
                                                                    <p className="text-sm text-[#C2185B] opacity-60">
                                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <span className={`text-sm px-3 py-1.5 rounded-full font-bold border inline-flex items-center gap-1.5 ${getStatusColor(order.orderStatus)}`}>
                                                                    {getStatusIcon(order.orderStatus)}
                                                                    {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Products List */}
                                                            <div className="space-y-2 mb-3">
                                                                {order.products?.map((item, pIdx) => (
                                                                    <div key={pIdx} className="flex items-center gap-3 text-sm">
                                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                                                            {item.image ? (
                                                                                <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                                                            ) : (
                                                                                <Package size={16} className="text-[#C2185B]" />
                                                                            )}
                                                                        </div>
                                                                        <span className="flex-1 text-[#2D2D2D]">{item.name}</span>
                                                                        <span className="text-[#C2185B] font-medium">x{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between pt-3 border-t border-[#F8BBD9]/20">
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <CreditCard size={14} />
                                                                    <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</span>
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === "paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                                                                        {order.paymentStatus}
                                                                    </span>
                                                                </div>
                                                                <p className="font-black text-[#C2185B] text-xl">${order.totalAmount?.toFixed(2)}</p>
                                                            </div>
                                                            
                                                            {order.shippingAddress?.fullName && (
                                                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                                    <MapPin size={12} className="text-[#C2185B]" />
                                                                    {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* WISHLIST SECTION */}
                                {activeSection === "wishlist" && (
                                    <motion.div key="wishlist" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <motion.button 
                                                    onClick={() => setActiveSection("profile")}
                                                    className="p-2 hover:bg-[#FFF5F7] rounded-xl transition-colors"
                                                    whileHover={{ x: -3 }}
                                                >
                                                    <ArrowLeft size={20} className="text-[#C2185B]" />
                                                </motion.button>
                                                <h3 className="text-xl font-black text-[#880E4F]">My Wishlist</h3>
                                            </div>
                                            
                                            {wishlist.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <Heart size={64} className="text-[#F8BBD9] mx-auto mb-4" />
                                                    <p className="text-xl font-bold text-[#880E4F]">Your wishlist is empty</p>
                                                    <p className="text-[#C2185B] opacity-60 mt-2">Save items you love</p>
                                                    <motion.button
                                                        onClick={() => navigate("/")}
                                                        className="mt-6 px-8 py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-bold shadow-lg"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        Browse Products
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {wishlist.map((item, idx) => (
                                                        <motion.div
                                                            key={item._id || idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="bg-[#FFF5F7] rounded-xl p-4 border border-[#F8BBD9]/20"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden">
                                                                    {item.image ? (
                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Package size={24} className="text-[#F8BBD9]" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-[#880E4F]">{item.name}</h4>
                                                                    <p className="text-[#C2185B] font-black">${item.price?.toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* REVIEWS SECTION */}
                                {activeSection === "reviews" && (
                                    <motion.div key="reviews" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <motion.button 
                                                    onClick={() => setActiveSection("profile")}
                                                    className="p-2 hover:bg-[#FFF5F7] rounded-xl transition-colors"
                                                    whileHover={{ x: -3 }}
                                                >
                                                    <ArrowLeft size={20} className="text-[#C2185B]" />
                                                </motion.button>
                                                <h3 className="text-xl font-black text-[#880E4F]">My Reviews</h3>
                                            </div>
                                            
                                            <div className="text-center py-12">
                                                <Star size={64} className="text-[#F8BBD9] mx-auto mb-4" />
                                                <p className="text-xl font-bold text-[#880E4F]">No reviews yet</p>
                                                <p className="text-[#C2185B] opacity-60 mt-2">Purchase products to leave reviews</p>
                                                <motion.button
                                                    onClick={() => navigate("/")}
                                                    className="mt-6 px-8 py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-bold shadow-lg"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    Browse Products
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SETTINGS SECTION */}
                                {activeSection === "settings" && (
                                    <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <motion.button 
                                                    onClick={() => setActiveSection("profile")}
                                                    className="p-2 hover:bg-[#FFF5F7] rounded-xl transition-colors"
                                                    whileHover={{ x: -3 }}
                                                >
                                                    <ArrowLeft size={20} className="text-[#C2185B]" />
                                                </motion.button>
                                                <h3 className="text-xl font-black text-[#880E4F]">Settings</h3>
                                            </div>

                                            {/* Notifications */}
                                            <div className="p-5 bg-[#FFF5F7] rounded-2xl border border-[#F8BBD9]/20 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#FCE4EC] rounded-xl flex items-center justify-center text-[#C2185B]">
                                                            <Bell size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#880E4F]">Email Notifications</p>
                                                            <p className="text-sm text-[#C2185B] opacity-60">Order updates & promotions</p>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        className="w-12 h-7 bg-[#C2185B] rounded-full relative"
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => toast.success("Notification settings saved!")}
                                                    >
                                                        <motion.div className="w-5 h-5 bg-white rounded-full absolute top-1 right-1 shadow-md" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Change Password */}
                                            <div className="p-5 bg-[#FFF5F7] rounded-2xl border border-[#F8BBD9]/20 mb-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-[#FCE4EC] rounded-xl flex items-center justify-center text-[#C2185B]">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#880E4F]">Security</p>
                                                        <p className="text-sm text-[#C2185B] opacity-60">Password & account security</p>
                                                    </div>
                                                </div>
                                                <motion.button 
                                                    className="w-full p-3 bg-white rounded-xl font-medium text-[#880E4F] border border-[#F8BBD9]/30 flex items-center justify-between hover:bg-[#FFF5F7] transition-colors"
                                                    whileHover={{ x: 5 }}
                                                    onClick={() => toast("Password change coming in next update!", {icon: '🔒'})}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Wallet size={18} className="text-[#C2185B]" />
                                                        Change Password
                                                    </span>
                                                    <ChevronRight size={16} className="text-[#C2185B]" />
                                                </motion.button>
                                            </div>

                                            {/* Logout */}
                                            <motion.button
                                                onClick={handleLogout}
                                                className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <LogOut size={20} />
                                                Logout from Account
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Sidebar */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Quick Menu */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg">
                                <h3 className="text-lg font-black text-[#880E4F] mb-4">Quick Links</h3>
                                <div className="space-y-1">
                                    {menuItems.map((item, idx) => (
                                        <motion.button 
                                            key={idx}
                                            onClick={() => {
                                                if (item.id === "wishlist") {
                                                    navigate("/wishlist");
                                                } else {
                                                    setActiveSection(item.id);
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                                                activeSection === item.id 
                                                    ? "bg-gradient-to-r from-[#FCE4EC] to-[#FFF5F7] border border-[#F8BBD9]" 
                                                    : "hover:bg-[#FFF5F7]"
                                            }`}
                                            whileHover={{ x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                                activeSection === item.id 
                                                    ? "bg-[#C2185B] text-white" 
                                                    : "bg-[#FFF5F7] text-[#C2185B] group-hover:bg-[#C2185B] group-hover:text-white"
                                            }`}>
                                                <item.icon size={18} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className={`font-semibold transition-colors ${
                                                    activeSection === item.id ? "text-[#C2185B]" : "text-[#2D2D2D] group-hover:text-[#C2185B]"
                                                }`}>{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <ChevronRight size={16} className={`transition-colors ${
                                                activeSection === item.id ? "text-[#C2185B]" : "text-gray-400 group-hover:text-[#C2185B]"
                                            }`} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-2xl p-6 shadow-xl shadow-[#C2185B]/20 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShoppingBag size={24} />
                                    <h3 className="text-lg font-black">Cart</h3>
                                </div>
                                <p className="text-white/80 text-sm mb-2">{cart?.length || 0} items</p>
                                <p className="text-3xl font-black mb-4">
                                    ${cart?.reduce((acc, item) => acc + (item.price * item.quantity), 0)?.toFixed(2) || "0.00"}
                                </p>
                                <motion.button
                                    className="w-full py-3 bg-white text-[#C2185B] rounded-xl font-bold shadow-lg"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate("/cart")}
                                >
                                    View Cart
                                </motion.button>
                            </div>

                            {/* Member Since */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F8BBD9]/40 shadow-lg text-center">
                                <Calendar size={32} className="text-[#C2185B] mx-auto mb-2" />
                                <p className="text-sm text-[#C2185B] opacity-60 font-medium">Member Since</p>
                                <p className="text-lg font-black text-[#880E4F]">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "April 2026"}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;