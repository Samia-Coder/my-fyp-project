import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    ShoppingBag, 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    XCircle,
    ChevronRight,
    Calendar,
    DollarSign,
    MapPin,
    CreditCard,
    Banknote
} from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("/orders/my-orders");
            console.log("Orders API Response:", res.data); // Debug ke liye
            
            // Safe data extraction
            const ordersData = res.data?.orders || res.data || [];
            setOrders(ordersData);
        } catch (error) {
            console.error("Fetch orders error:", error);
            setError(error.response?.data?.message || "Failed to load orders");
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "placed": return <Clock size={18} className="text-blue-500" />;
            case "processing": return <Package size={18} className="text-yellow-500" />;
            case "shipped": return <Truck size={18} className="text-purple-500" />;
            case "delivered": return <CheckCircle size={18} className="text-green-500" />;
            case "cancelled": return <XCircle size={18} className="text-red-500" />;
            default: return <Clock size={18} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "placed": return "bg-blue-50 text-blue-600 border-blue-200";
            case "processing": return "bg-yellow-50 text-yellow-600 border-yellow-200";
            case "shipped": return "bg-purple-50 text-purple-600 border-purple-200";
            case "delivered": return "bg-green-50 text-green-600 border-green-200";
            case "cancelled": return "bg-red-50 text-red-600 border-red-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    const getPaymentIcon = (method) => {
        return method === "card" 
            ? <CreditCard size={16} className="text-[#C2185B]" />
            : <Banknote size={16} className="text-green-600" />;
    };

    // Safe ID formatter
    const formatOrderId = (id) => {
        if (!id) return "N/A";
        const idStr = id.toString ? id.toString() : String(id);
        return idStr.slice(-8).toUpperCase();
    };

    // Safe date formatter
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return "N/A";
        }
    };

    // Safe price formatter
    const formatPrice = (price) => {
        const num = Number(price);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    // Safe address formatter
    const formatAddress = (address) => {
        if (!address) return "No address provided";
        if (typeof address === 'string') return address;
        if (typeof address === 'object') {
            const parts = [];
            if (address.fullName) parts.push(address.fullName);
            if (address.phone) parts.push(address.phone);
            if (address.address) parts.push(address.address);
            if (address.city) parts.push(address.city);
            if (address.postalCode) parts.push(address.postalCode);
            return parts.join(", ") || "No address provided";
        }
        return "No address provided";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#F8BBD9] border-t-[#C2185B] rounded-full animate-spin" />
                    <p className="text-[#880E4F] font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-12 text-center border border-red-200 shadow-xl max-w-md"
                >
                    <XCircle size={64} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Orders</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button 
                        onClick={fetchOrders}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C2185B] to-[#880E4F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-xl shadow-lg shadow-[#C2185B]/20">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#880E4F]">My Orders</h1>
                            <p className="text-sm text-gray-500">
                                {orders.length} {orders.length === 1 ? "order" : "orders"} found
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-3xl p-12 text-center border border-[#F8BBD9]/30 shadow-xl"
                    >
                        <Package size={64} className="text-[#F8BBD9] mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[#880E4F] mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                        <Link 
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C2185B] to-[#880E4F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Start Shopping
                            <ChevronRight size={18} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl border border-[#F8BBD9]/30 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="p-5 border-b border-[#F8BBD9]/20 bg-[#FFF5F7]/50">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-[#880E4F]">
                                                Order #{formatOrderId(order._id)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)} flex items-center gap-1.5`}>
                                                {getStatusIcon(order.orderStatus)}
                                                {order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="p-5 space-y-4">
                                    {(order.products || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/30 overflow-hidden flex-shrink-0">
                                                {item?.image ? (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name || "Product"}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package size={24} className="text-[#F8BBD9]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[#2D2D2D] truncate">{item?.name || "Unknown Product"}</h3>
                                                <p className="text-sm text-gray-500">Qty: {item?.quantity || 0}</p>
                                                <p className="text-sm font-bold text-[#C2185B]">${formatPrice(item?.price)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#880E4F]">
                                                    ${formatPrice((item?.price || 0) * (item?.quantity || 0))}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="p-5 bg-[#FFF5F7]/30 border-t border-[#F8BBD9]/20">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1.5 text-gray-600">
                                                {getPaymentIcon(order.paymentMethod)}
                                                <span className="capitalize">
                                                    {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "card" ? "Card Payment" : "Unknown"}
                                                </span>
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                order.paymentStatus === "paid" 
                                                    ? "bg-green-100 text-green-600" 
                                                    : "bg-yellow-100 text-yellow-600"
                                            }`}>
                                                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Total:</span>
                                            <span className="text-xl font-black text-[#C2185B]">
                                                ${formatPrice(order.totalAmount)}
                                            </span>
                                        </div>
                                    </div>

                                    {order.couponCode && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                            <DollarSign size={14} />
                                            Coupon Applied: <span className="font-bold">{order.couponCode}</span>
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin size={14} className="text-[#C2185B]" />
                                        {formatAddress(order.shippingAddress)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;