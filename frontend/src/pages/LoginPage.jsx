import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader, Eye, EyeOff, Sparkles } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login, loading } = useUserStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className='min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden'>
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#C2185B]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F8BBD9]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    className='text-center mb-8'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-2xl shadow-xl shadow-[#C2185B]/30 mb-4">
                        <img src="/public/image/Untitled_design__9_-removebg-preview.png" alt="" />
                    </div>
                    <h2 className='text-3xl font-bold text-[#880E4F]'>Welcome Back!</h2>
                    <p className="text-gray-500 mt-2">Sign in to your Safira Mart account</p>
                </motion.div>

                <motion.div
                    className='bg-white rounded-3xl shadow-xl shadow-[#C2185B]/10 border border-[#F8BBD9]/30 overflow-hidden'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="bg-[#FFF5F7] px-8 py-6 border-b border-[#F8BBD9]/30">
                        <div className="flex items-center gap-2 text-[#C2185B]">
                            <Sparkles size={18} />
                            <span className="text-sm font-medium">Secure Login</span>
                        </div>
                    </div>

                    <div className='p-8'>
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div>
                                <label htmlFor='email' className='block text-sm font-medium text-[#880E4F] mb-2'>
                                    Email Address
                                </label>
                                <div className='relative group'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <Mail className='h-5 w-5 text-[#C2185B] group-focus-within:text-[#880E4F] transition-colors' />
                                    </div>
                                    <input
                                        id='email'
                                        type='email'
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='block w-full px-4 py-3 pl-12 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300'
                                        placeholder='you@example.com'
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor='password' className='block text-sm font-medium text-[#880E4F] mb-2'>
                                    Password
                                </label>
                                <div className='relative group'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <Lock className='h-5 w-5 text-[#C2185B] group-focus-within:text-[#880E4F] transition-colors' />
                                    </div>
                                    <input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='block w-full px-4 py-3 pl-12 pr-12 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300'
                                        placeholder='••••••••'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#C2185B] hover:text-[#880E4F]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-[#F8BBD9] text-[#C2185B] focus:ring-[#C2185B]"
                                    />
                                    <span className="text-sm text-gray-500">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm text-[#C2185B] hover:text-[#880E4F] font-medium">
                                    Forgot password?
                                </Link>
                            </div>

                            <motion.button
                                type='submit'
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className='w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-[#C2185B]/25 text-sm font-bold text-white bg-[#C2185B] hover:bg-[#880E4F] focus:outline-none focus:ring-4 focus:ring-[#C2185B]/20 transition duration-300 disabled:opacity-50'
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader className='mr-2 h-5 w-5 animate-spin' /> Signing in...</>
                                ) : (
                                    <><LogIn className='mr-2 h-5 w-5' /> Sign In</>
                                )}
                            </motion.button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#F8BBD9]/50" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#F8BBD9]/50 rounded-xl hover:bg-[#FFF5F7] transition-colors text-sm font-medium text-gray-600">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#F8BBD9]/50 rounded-xl hover:bg-[#FFF5F7] transition-colors text-sm font-medium text-gray-600">
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                                Facebook
                            </button>
                        </div>

                        <p className='mt-8 text-center text-sm text-gray-500'>
                            Don't have an account?{" "}
                            <Link to='/signup' className='font-bold text-[#C2185B] hover:text-[#880E4F] transition-colors inline-flex items-center gap-1'>
                                Sign up now <ArrowRight className='inline h-4 w-4' />
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;