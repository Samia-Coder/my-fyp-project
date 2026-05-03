import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Tag, Check, X, Gift, Percent, Zap } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import toast from "react-hot-toast";

const GiftCouponCard = () => {
    const [userInputCode, setUserInputCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [showCoupons, setShowCoupons] = useState(false);

    // Available coupons (yeh backend se bhi aa sakta hai)
    const availableCoupons = [
        { code: "WELCOME20", discount: 20, type: "percent", description: "20% off on first order", minOrder: 50 },
        { code: "SAVE10", discount: 10, type: "percent", description: "10% off sitewide", minOrder: 30 },
        { code: "FREESHIP", discount: 0, type: "shipping", description: "Free shipping", minOrder: 0 },
        { code: "FLASH50", discount: 50, type: "percent", description: "50% off flash sale", minOrder: 100 },
    ];

    const handleApplyCoupon = async () => {
        if (!userInputCode.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        setIsApplying(true);

        // Simulate API call (1 second delay)
        setTimeout(() => {
            const found = availableCoupons.find(
                (c) => c.code.toLowerCase() === userInputCode.trim().toLowerCase()
            );

            if (found) {
                setAppliedCoupon(found);
                toast.success(`🎉 Coupon "${found.code}" applied! ${found.discount}% off`);
                // Yahan aap cart store mein bhi coupon save kar sakte hain
            } else {
                toast.error("Invalid coupon code. Try the codes below!");
            }
            setIsApplying(false);
        }, 800);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setUserInputCode("");
        toast.success("Coupon removed");
    };

    const applyPresetCoupon = (coupon) => {
        setUserInputCode(coupon.code);
        setAppliedCoupon(coupon);
        toast.success(`🎉 ${coupon.code} applied!`);
        setShowCoupons(false);
    };

    return (
        <motion.div
            className='bg-white rounded-3xl p-6 border border-[#F8BBD9]/30 shadow-xl shadow-[#F8BBD9]/10 overflow-hidden relative'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            {/* Decorative background */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-[#F8BBD9]/10 to-transparent rounded-full blur-2xl" />

            {/* Header */}
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-lg shadow-md">
                        <Ticket size={18} className="text-white" />
                    </div>
                    <h3 className='text-lg font-bold text-[#880E4F]'>Gift / Coupon Code</h3>
                </div>

                {/* Applied Coupon Display */}
                <AnimatePresence>
                    {appliedCoupon && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-full">
                                        <Check size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-700">{appliedCoupon.code}</p>
                                        <p className="text-sm text-green-600">
                                            {appliedCoupon.discount > 0 
                                                ? `${appliedCoupon.discount}% OFF` 
                                                : "Free Shipping"
                                            }
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleRemoveCoupon}
                                    className="p-1.5 hover:bg-green-200 rounded-full transition-colors"
                                >
                                    <X size={16} className="text-green-600" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Section */}
                {!appliedCoupon && (
                    <motion.div 
                        className="flex gap-2 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="relative flex-1">
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8BBD9]" />
                            <input
                                type='text'
                                value={userInputCode}
                                onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
                                placeholder='Enter coupon code (e.g. WELCOME20)'
                                className='w-full pl-10 pr-4 py-3 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-sm text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all'
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleApplyCoupon}
                            disabled={isApplying}
                            className='px-6 py-3 bg-gradient-to-r from-[#C2185B] to-[#880E4F] text-white font-bold rounded-xl shadow-lg shadow-[#C2185B]/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap'
                        >
                            {isApplying ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                "Apply"
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* Available Coupons Toggle */}
                {!appliedCoupon && (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="w-full flex items-center justify-between p-3 bg-[#FFF5F7] rounded-xl border border-[#F8BBD9]/30 text-sm font-medium text-[#C2185B] hover:bg-[#F8BBD9]/20 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Gift size={16} />
                            Available Coupons ({availableCoupons.length})
                        </span>
                        <motion.div
                            animate={{ rotate: showCoupons ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Zap size={16} />
                        </motion.div>
                    </motion.button>
                )}

                {/* Coupon List */}
                <AnimatePresence>
                    {showCoupons && !appliedCoupon && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 overflow-hidden"
                        >
                            {availableCoupons.map((coupon, idx) => (
                                <motion.div
                                    key={coupon.code}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    onClick={() => applyPresetCoupon(coupon)}
                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFF5F7] to-white rounded-xl border border-[#F8BBD9]/30 cursor-pointer hover:border-[#C2185B]/50 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-lg">
                                            <Percent size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#880E4F] text-sm">{coupon.code}</p>
                                            <p className="text-xs text-gray-500">{coupon.description}</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="px-3 py-1.5 bg-[#C2185B] text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Apply
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GiftCouponCard;