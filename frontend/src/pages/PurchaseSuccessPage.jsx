import { ArrowRight, CheckCircle, HandHeart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";
import axios from "../lib/axios";
import { motion } from "framer-motion";

const PurchaseSuccessPage = () => {
    const [isProcessing, setIsProcessing] = useState(true);
    const { clearCart } = useCartStore();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCheckoutSuccess = async (sessionId) => {
            try {
                await axios.post("/payments/success", { sessionId });
                clearCart();
            } catch (error) {
                console.log(error);
                setError("Error processing payment");
            } finally {
                setIsProcessing(false);
            }
        };

        const sessionId = new URLSearchParams(window.location.search).get("session_id");
        if (sessionId) {
            handleCheckoutSuccess(sessionId);
        } else {
            setIsProcessing(false);
            setError("No session ID found in the URL");
        }
    }, [clearCart]);

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#F8BBD9] border-t-[#C2185B] rounded-full animate-spin" />
                    <p className="text-[#880E4F] font-medium">Processing your order...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center max-w-md">
                    <XCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Oops!</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link to="/" className="bg-[#C2185B] text-white px-6 py-3 rounded-xl font-bold">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4'>
            <Confetti 
                width={window.innerWidth} 
                height={window.innerHeight} 
                gravity={0.1} 
                style={{ zIndex: 99 }} 
                numberOfPieces={700} 
                recycle={false} 
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full bg-white rounded-3xl shadow-xl shadow-[#C2185B]/10 overflow-hidden relative z-10 border border-[#F8BBD9]/30'
            >
                <div className='p-8'>
                    <div className='flex justify-center mb-4'>
                        <div className="p-4 bg-green-50 rounded-full">
                            <CheckCircle className='text-green-500 w-16 h-16' />
                        </div>
                    </div>
                    
                    <h1 className='text-3xl font-black text-center text-[#880E4F] mb-2'>
                        Order Placed!
                    </h1>
                    <p className='text-gray-500 text-center mb-2'>
                        Thank you for shopping with us.
                    </p>
                    <p className='text-[#C2185B] text-center text-sm mb-6 font-medium'>
                        Check your email for order details.
                    </p>

                    {/* Order Details Box */}
                    <div className='bg-[#FFF5F7] rounded-2xl p-5 mb-6 border border-[#F8BBD9]/30'>
                        <div className='flex items-center justify-between mb-3'>
                            <span className='text-sm text-gray-500'>Order Status</span>
                            <span className='text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full'>
                                Confirmed
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-500'>Delivery</span>
                            <span className='text-sm font-bold text-[#880E4F]'>
                                3-5 Business Days
                            </span>
                        </div>
                    </div>

                    <div className='space-y-3'>
                        {/* View Orders Button */}
                        <Link 
                            to="/orders"
                            className='w-full bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:from-[#880E4F] hover:to-[#C2185B] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#C2185B]/30'
                        >
                            <ShoppingBag className='mr-2' size={18} />
                            View My Orders
                        </Link>
                        
                        <Link 
                            to="/"
                            className='w-full bg-[#FFF5F7] hover:bg-[#FCE4EC] text-[#C2185B] font-bold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center border border-[#F8BBD9]'
                        >
                            Continue Shopping
                            <ArrowRight className='ml-2' size={18} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PurchaseSuccessPage;