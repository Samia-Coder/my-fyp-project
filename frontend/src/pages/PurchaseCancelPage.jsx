import { XCircle, ArrowLeft, ShoppingBag, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
    return (
        <div className='min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full bg-white rounded-3xl shadow-xl shadow-red-500/10 overflow-hidden relative z-10 border border-red-200'
            >
                <div className='p-8'>
                    <div className='flex justify-center mb-4'>
                        <div className="p-4 bg-red-50 rounded-full">
                            <XCircle className='text-red-500 w-16 h-16' />
                        </div>
                    </div>
                    
                    <h1 className='text-3xl font-black text-center text-red-600 mb-2'>
                        Payment Cancelled
                    </h1>
                    <p className='text-gray-500 text-center mb-6'>
                        Your order was not placed. No charges were made to your account.
                    </p>

                    {/* Info Box */}
                    <div className='bg-red-50 rounded-2xl p-5 mb-6 border border-red-200'>
                        <p className='text-sm text-red-600 text-center font-medium'>
                            Having trouble? Try Cash on Delivery or contact our support team.
                        </p>
                    </div>

                    <div className='space-y-3'>
                        {/* Try COD Button */}
                        <Link
                            to="/cart"
                            className='w-full bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:from-[#880E4F] hover:to-[#C2185B] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#C2185B]/30'
                        >
                            <RotateCcw className='mr-2' size={18} />
                            Try Again
                        </Link>

                        <Link
                            to="/"
                            className='w-full bg-[#FFF5F7] hover:bg-[#FCE4EC] text-[#C2185B] font-bold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center border border-[#F8BBD9]'
                        >
                            <ArrowLeft className='mr-2' size={18} />
                            Return to Shop
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PurchaseCancelPage;