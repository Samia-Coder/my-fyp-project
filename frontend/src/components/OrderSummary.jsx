import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import {
    MoveRight,
    Receipt,
    Truck,
    Tag,
    Sparkles,
    ShieldCheck,
    WifiOff,
    CreditCard,
    Banknote,
    Check,
    AlertCircle,
    MapPin,
    User,
    Phone,
    ChevronDown,
    ChevronUp,
    Save
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useState, useCallback, useEffect } from "react";

const OrderSummary = () => {
    const { total, subtotal, coupon, isCouponApplied, cart, clearCart } = useCartStore();
    const [stripe, setStripe] = useState(null);
    const [stripeLoading, setStripeLoading] = useState(false);
    const [stripeError, setStripeError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [isProcessing, setIsProcessing] = useState(false);
    
    // ⬇️ SHIPPING ADDRESS STATE
    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Pakistan"
    });
    
    // ⬇️ FORM VISIBILITY STATE
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressFilled, setAddressFilled] = useState(false);

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    const isStripeKeyValid = stripeKey && stripeKey.startsWith("pk_") && stripeKey !== "pk_test_placeholder";

    // ⬇️ LOAD SAVED ADDRESS FROM LOCALSTORAGE ON MOUNT
    useEffect(() => {
        const savedAddress = localStorage.getItem("safira_shipping_address");
        if (savedAddress) {
            try {
                const parsed = JSON.parse(savedAddress);
                setShippingAddress(parsed);
                setAddressFilled(true);
            } catch (e) {
                console.error("Error parsing saved address:", e);
            }
        }
    }, []);

    // Load Stripe only when card is selected and key is valid
    useEffect(() => {
        let isMounted = true;

        if (paymentMethod !== "card" || !isStripeKeyValid) {
            setStripeLoading(false);
            setStripe(null);
            if (paymentMethod === "card" && !isStripeKeyValid) {
                setStripeError("Stripe key not configured. Please use Cash on Delivery.");
            } else {
                setStripeError(null);
            }
            return;
        }

        setStripeLoading(true);
        setStripeError(null);

        const initStripe = async () => {
            try {
                const stripeInstance = await loadStripe(stripeKey);
                if (!isMounted) return;
                if (!stripeInstance) {
                    throw new Error("Stripe failed to initialize.");
                }
                setStripe(stripeInstance);
                setStripeError(null);
            } catch (error) {
                if (!isMounted) return;
                console.error("Stripe init error:", error);
                setStripeError("Card payment unavailable. Use Cash on Delivery.");
            } finally {
                if (isMounted) setStripeLoading(false);
            }
        };

        initStripe();
        return () => { isMounted = false; };
    }, [paymentMethod, stripeKey, isStripeKeyValid]);

    // ⬇️ INPUT HANDLER
    const handleAddressChange = (e) => {
        const updated = {
            ...shippingAddress,
            [e.target.name]: e.target.value
        };
        setShippingAddress(updated);
        
        // Check if all required fields are filled
        const isComplete = updated.fullName && updated.phone && updated.address && 
                          updated.city && updated.postalCode;
        setAddressFilled(isComplete);
    };

    // ⬇️ SAVE ADDRESS TO LOCALSTORAGE
    const saveAddress = () => {
        localStorage.setItem("safira_shipping_address", JSON.stringify(shippingAddress));
        toast.success("Address saved for future orders!");
    };

    // ⬇️ VALIDATION
    const validateAddress = () => {
        if (!shippingAddress.fullName.trim()) {
            toast.error("Please enter your full name");
            setShowAddressForm(true);
            return false;
        }
        if (!shippingAddress.phone.trim()) {
            toast.error("Please enter your phone number");
            setShowAddressForm(true);
            return false;
        }
        if (!shippingAddress.address.trim()) {
            toast.error("Please enter your address");
            setShowAddressForm(true);
            return false;
        }
        if (!shippingAddress.city.trim()) {
            toast.error("Please enter your city");
            setShowAddressForm(true);
            return false;
        }
        if (!shippingAddress.postalCode.trim()) {
            toast.error("Please enter postal code");
            setShowAddressForm(true);
            return false;
        }
        return true;
    };

    const handleCardPayment = useCallback(async () => {
        if (!validateAddress()) return;

        if (!stripe) {
            toast.error("Stripe is not configured. Please use Cash on Delivery or contact support.");
            return;
        }

        if (cart.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        setIsProcessing(true);
        try {
            // Save address before payment
            localStorage.setItem("safira_shipping_address", JSON.stringify(shippingAddress));
            
            const res = await axios.post("/payments/checkout", {
                products: cart,
                couponCode: coupon ? coupon.code : null,
                shippingAddress
            });

            const session = res.data;
            if (!session?.id) throw new Error("Invalid session from server.");

            const result = await stripe.redirectToCheckout({ sessionId: session.id });
            if (result?.error) throw new Error(result.error.message);
        } catch (error) {
            console.error("Payment error:", error);
            const message = error?.response?.data?.message || error?.message || "Payment failed.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    }, [stripe, cart, coupon, shippingAddress]);

    const handleCODPayment = useCallback(async () => {
        if (!validateAddress()) return;

        if (cart.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }
        
        setIsProcessing(true);
        try {
            // Save address before placing order
            localStorage.setItem("safira_shipping_address", JSON.stringify(shippingAddress));
            
            const res = await axios.post("/orders/cod", {
                products: cart,
                couponCode: coupon ? coupon.code : null,
                totalAmount: total,
                shippingAddress
            });
            
            if (res.data.success) {
                toast.success("✅ Order placed! Pay cash on delivery.");
                clearCart();
            } else {
                throw new Error(res.data.message || "Failed to place order.");
            }
        } catch (error) {
            console.error("COD Error:", error);
            const message = error?.response?.data?.message || error?.message || "Failed to place order.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    }, [cart, coupon, total, clearCart, shippingAddress]);

    const handlePayment = useCallback(() => {
        if (paymentMethod === "card") {
            handleCardPayment();
        } else {
            handleCODPayment();
        }
    }, [paymentMethod, handleCardPayment, handleCODPayment]);

    const isButtonDisabled = isProcessing;

    return (
        <motion.div
            className="bg-white rounded-3xl p-6 border border-[#F8BBD9]/30 shadow-xl shadow-[#F8BBD9]/10 overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-[#F8BBD9]/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-xl shadow-md">
                        <Receipt size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black text-[#880E4F]">Order Summary</h3>
                </div>

                <div className="space-y-4">
                    {/* Price Breakdown */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                <Tag size={14} className="text-[#F8BBD9]" />
                                Original Price
                            </span>
                            <span className="text-sm font-bold text-[#2D2D2D]">${formattedSubtotal}</span>
                        </div>

                        {savings > 0 && (
                            <motion.div
                                className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                            >
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                    <Sparkles size={14} />
                                    You Saved
                                </span>
                                <span className="text-sm font-black text-green-600">-${formattedSavings}</span>
                            </motion.div>
                        )}

                        {coupon && isCouponApplied && (
                            <motion.div
                                className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-[#FFF5F7] to-[#FCE4EC] rounded-xl border border-[#F8BBD9]"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                            >
                                <span className="text-sm font-medium text-[#C2185B] flex items-center gap-1.5">
                                    <Tag size={14} />
                                    Coupon ({coupon.code})
                                </span>
                                <span className="text-sm font-black text-[#C2185B]">-{coupon.discountPercentage}%</span>
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                <Truck size={14} className="text-[#F8BBD9]" />
                                Shipping
                            </span>
                            <span className="text-sm font-bold text-green-600">FREE</span>
                        </div>

                        <div className="border-t-2 border-dashed border-[#F8BBD9]/30 pt-3">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-lg font-black text-[#880E4F]">Total</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-[#C2185B]">${formattedTotal}</span>
                                    {savings > 0 && (
                                        <p className="text-xs text-green-600 font-medium">You saved ${formattedSavings}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ⬇️ SHIPPING ADDRESS SECTION */}
                    <div className="space-y-3">
                        <div 
                            className="flex items-center justify-between cursor-pointer p-2 hover:bg-[#FFF5F7] rounded-xl transition-colors"
                            onClick={() => setShowAddressForm(!showAddressForm)}
                        >
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin size={14} className="text-[#C2185B]" />
                                Shipping Address
                                {addressFilled && (
                                    <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        FILLED
                                    </span>
                                )}
                            </label>
                            <motion.span 
                                className="text-[#C2185B] font-medium"
                                animate={{ rotate: showAddressForm ? 180 : 0 }}
                            >
                                <ChevronDown size={18} />
                            </motion.span>
                        </div>

                        <AnimatePresence>
                            {showAddressForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="Full Name *"
                                                value={shippingAddress.fullName}
                                                onChange={handleAddressChange}
                                                className="w-full pl-10 pr-3 py-2.5 bg-[#FFF5F7] border border-[#F8BBD9]/30 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="03XXXXXXXXX *"
                                                value={shippingAddress.phone}
                                                onChange={handleAddressChange}
                                                className="w-full pl-10 pr-3 py-2.5 bg-[#FFF5F7] border border-[#F8BBD9]/30 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="House #, Street, Area *"
                                            value={shippingAddress.address}
                                            onChange={handleAddressChange}
                                            className="w-full pl-10 pr-3 py-2.5 bg-[#FFF5F7] border border-[#F8BBD9]/30 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City *"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2.5 bg-[#FFF5F7] border border-[#F8BBD9]/30 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
                                        />
                                        <input
                                            type="text"
                                            name="postalCode"
                                            placeholder="Postal Code *"
                                            value={shippingAddress.postalCode}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2.5 bg-[#FFF5F7] border border-[#F8BBD9]/30 rounded-xl text-sm focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        name="country"
                                        value="Pakistan"
                                        readOnly
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                                    />

                                    {/* Save Button */}
                                    <motion.button
                                        onClick={saveAddress}
                                        className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Save size={16} />
                                        Save Address for Future Orders
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Show filled address summary (when form is closed) */}
                        {!showAddressForm && addressFilled && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-gradient-to-r from-[#FFF5F7] to-[#FCE4EC] rounded-xl border border-[#F8BBD9]/30 text-sm space-y-1"
                            >
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-[#C2185B]" />
                                    <span className="font-bold text-[#880E4F]">{shippingAddress.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-[#C2185B]" />
                                    <span className="text-gray-600">{shippingAddress.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-[#C2185B]" />
                                    <span className="text-gray-600">{shippingAddress.address}</span>
                                </div>
                                <p className="text-gray-600 pl-6">{shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
                            </motion.div>
                        )}

                        {/* Warning if address not filled */}
                        {!showAddressForm && !addressFilled && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2"
                            >
                                <AlertCircle size={16} className="text-orange-500" />
                                <p className="text-xs text-orange-600 font-medium">
                                    Please add your shipping address to place order
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</label>

                        {/* Card Option */}
                        <button
                            onClick={() => setPaymentMethod("card")}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                                paymentMethod === "card" ? "border-[#C2185B] bg-[#FFF5F7]" : "border-gray-200 hover:border-[#F8BBD9]/50"
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${paymentMethod === "card" ? "bg-[#C2185B] text-white" : "bg-gray-100 text-gray-500"}`}>
                                <CreditCard size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-bold text-[#2D2D2D]">Card Payment</p>
                                <p className="text-xs text-gray-400">Stripe - Credit/Debit Card</p>
                            </div>
                            {paymentMethod === "card" && <Check size={18} className="text-[#C2185B]" />}
                        </button>

                        {/* COD Option */}
                        <button
                            onClick={() => setPaymentMethod("cod")}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                                paymentMethod === "cod" ? "border-[#C2185B] bg-[#FFF5F7]" : "border-gray-200 hover:border-[#F8BBD9]/50"
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${paymentMethod === "cod" ? "bg-[#C2185B] text-white" : "bg-gray-100 text-gray-500"}`}>
                                <Banknote size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-bold text-[#2D2D2D]">Cash on Delivery</p>
                                <p className="text-xs text-gray-400">Pay when you receive</p>
                            </div>
                            {paymentMethod === "cod" && <Check size={18} className="text-[#C2185B]" />}
                        </button>
                    </div>

                    {/* Stripe Status Messages */}
                    <AnimatePresence>
                        {paymentMethod === "card" && (
                            <>
                                {stripeLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2"
                                    >
                                        <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                        <p className="text-xs font-medium text-blue-600">Loading Stripe...</p>
                                    </motion.div>
                                )}

                                {!isStripeKeyValid && !stripeLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2"
                                    >
                                        <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-orange-600">
                                                Stripe not configured. Add VITE_STRIPE_PUBLIC_KEY to your .env file.
                                            </p>
                                            <button 
                                                onClick={() => setPaymentMethod("cod")} 
                                                className="text-xs text-[#C2185B] font-bold mt-1 hover:underline"
                                            >
                                                Switch to Cash on Delivery →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {stripeError && isStripeKeyValid && !stripeLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                                    >
                                        <WifiOff size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-red-600">{stripeError}</p>
                                            <button 
                                                onClick={() => setPaymentMethod("cod")} 
                                                className="text-xs text-[#C2185B] font-bold mt-1 hover:underline"
                                            >
                                                Switch to Cash on Delivery →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Checkout Button */}
                    <motion.button
                        className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                            isButtonDisabled
                                ? "bg-gray-400 cursor-not-allowed shadow-none"
                                : !addressFilled
                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700"
                                    : paymentMethod === "card" && (!stripe || stripeLoading)
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700"
                                        : "bg-gradient-to-r from-[#C2185B] to-[#880E4F] shadow-[#C2185B]/30 hover:from-[#880E4F] hover:to-[#C2185B]"
                        }`}
                        whileHover={!isButtonDisabled ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
                        onClick={handlePayment}
                        disabled={isButtonDisabled}
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : !addressFilled ? (
                            <>
                                Add Address to Continue
                                <MapPin size={20} />
                            </>
                        ) : paymentMethod === "card" ? (
                            <>
                                {(!stripe || stripeLoading) && !isStripeKeyValid ? (
                                    <>Configure Stripe<AlertCircle size={20} /></>
                                ) : (!stripe || stripeLoading) ? (
                                    <>Stripe Loading...<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                                ) : (
                                    <>Pay ${formattedTotal}<CreditCard size={20} /></>
                                )}
                            </>
                        ) : (
                            <>Place Order (COD)<Banknote size={20} /></>
                        )}
                    </motion.button>

                    {/* Trust Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-[#FFF5F7] rounded-xl p-3 border border-[#F8BBD9]/20">
                        <ShieldCheck size={14} className="text-[#C2185B]" />
                        {paymentMethod === "card" ? "Secure SSL Encrypted Payment" : "Pay only when you receive your order"}
                    </div>

                    {/* Continue Shopping */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="text-sm text-gray-400">or</span>
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#C2185B] hover:text-[#880E4F] transition-colors">
                            Continue Shopping<MoveRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderSummary;