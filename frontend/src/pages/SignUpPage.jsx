import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [agreed, setAgreed] = useState(false);

	const { signup, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
	};

	const updateForm = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const getPasswordStrength = (password) => {
		let strength = 0;
		if (password.length > 6) strength++;
		if (password.length > 10) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;
		return strength;
	};

	const strength = getPasswordStrength(formData.password);
	const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-[#C2185B]', 'bg-green-500'];
	const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

	return (
		<div className='min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden'>
			{/* Background Decorations */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-[#C2185B]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F8BBD9]/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
			
			<div className="relative z-10 w-full max-w-lg">
				{/* Logo */}
				<motion.div
					className='text-center mb-8'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-2xl shadow-xl shadow-[#C2185B]/30 mb-4">
						<img src="/public/image/Untitled_design__9_-removebg-preview.png" alt="" />
					</div>
					<h2 className='text-3xl font-bold text-[#880E4F]'>Create Account</h2>
					<p className="text-gray-500 mt-2">Join Safira Mart for exclusive deals</p>
				</motion.div>

				<motion.div
					className='bg-white rounded-3xl shadow-xl shadow-[#C2185B]/10 border border-[#F8BBD9]/30 overflow-hidden'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{/* Progress Steps */}
					<div className="bg-[#FFF5F7] px-8 py-4 border-b border-[#F8BBD9]/30">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#C2185B] text-white">
									1
								</div>
								<span className="text-sm font-medium text-[#880E4F]">Account</span>
							</div>
							<div className="flex-1 h-1 bg-[#F8BBD9] mx-3 rounded-full overflow-hidden">
								<div className="h-full bg-[#C2185B] w-full" />
							</div>
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#C2185B] text-white">
									2
								</div>
								<span className="text-sm font-medium text-[#880E4F]">Details</span>
							</div>
						</div>
					</div>

					<div className='p-8'>
						<form onSubmit={handleSubmit} className='space-y-5'>
							{/* Full Name */}
							<div>
								<label htmlFor='name' className='block text-sm font-medium text-[#880E4F] mb-2'>
									Full Name
								</label>
								<div className='relative group'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<User className='h-5 w-5 text-[#C2185B] group-focus-within:text-[#880E4F] transition-colors' aria-hidden='true' />
									</div>
									<input
										id='name'
										type='text'
										required
										value={formData.name}
										onChange={(e) => updateForm('name', e.target.value)}
										className='block w-full px-4 py-3 pl-12 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300 sm:text-sm'
										placeholder='John Doe'
									/>
								</div>
							</div>

							{/* Email */}
							<div>
								<label htmlFor='email' className='block text-sm font-medium text-[#880E4F] mb-2'>
									Email Address
								</label>
								<div className='relative group'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<Mail className='h-5 w-5 text-[#C2185B] group-focus-within:text-[#880E4F] transition-colors' aria-hidden='true' />
									</div>
									<input
										id='email'
										type='email'
										required
										value={formData.email}
										onChange={(e) => updateForm('email', e.target.value)}
										className='block w-full px-4 py-3 pl-12 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300 sm:text-sm'
										placeholder='you@example.com'
									/>
								</div>
							</div>

							{/* Password */}
							<div>
								<label htmlFor='password' className='block text-sm font-medium text-[#880E4F] mb-2'>
									Password
								</label>
								<div className='relative group'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<Lock className='h-5 w-5 text-[#C2185B] group-focus-within:text-[#880E4F] transition-colors' aria-hidden='true' />
									</div>
									<input
										id='password'
										type={showPassword ? 'text' : 'password'}
										required
										value={formData.password}
										onChange={(e) => updateForm('password', e.target.value)}
										className='block w-full px-4 py-3 pl-12 pr-12 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300 sm:text-sm'
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
								
								{/* Password Strength */}
								{formData.password && (
									<div className="mt-2">
										<div className="flex gap-1 mb-1">
											{[0, 1, 2, 3, 4].map((i) => (
												<div 
													key={i} 
													className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}
												/>
											))}
										</div>
										<p className="text-xs text-gray-500">
											Password strength: <span className={`font-medium ${strength > 0 ? 'text-[#C2185B]' : ''}`}>{strengthLabels[strength - 1] || 'Enter password'}</span>
										</p>
									</div>
								)}
							</div>

							{/* Confirm Password */}
							<div>
								<label htmlFor='confirmPassword' className='block text-sm font-medium text-[#880E4F] mb-2'>
									Confirm Password
								</label>
								<div className='relative group'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<Lock className='h-5 w-5 text-[#C2185B] group-focus-within:text-[#880E4F] transition-colors' aria-hidden='true' />
									</div>
									<input
										id='confirmPassword'
										type={showConfirmPassword ? 'text' : 'password'}
										required
										value={formData.confirmPassword}
										onChange={(e) => updateForm('confirmPassword', e.target.value)}
										className='block w-full px-4 py-3 pl-12 pr-12 bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:bg-white transition-all duration-300 sm:text-sm'
										placeholder='••••••••'
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#C2185B] hover:text-[#880E4F]"
									>
										{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
								{formData.confirmPassword && formData.password === formData.confirmPassword && (
									<div className="flex items-center gap-1 mt-1 text-green-500 text-xs">
										<CheckCircle size={14} /> Passwords match
									</div>
								)}
							</div>

							{/* Terms */}
							<div className="flex items-start gap-3">
								<input 
									type="checkbox" 
									checked={agreed}
									onChange={(e) => setAgreed(e.target.checked)}
									className="mt-1 w-4 h-4 rounded border-[#F8BBD9] text-[#C2185B] focus:ring-[#C2185B]"
								/>
								<p className="text-sm text-gray-500">
									I agree to the <Link to="/terms" className="text-[#C2185B] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#C2185B] hover:underline">Privacy Policy</Link>
								</p>
							</div>

							{/* Submit */}
							<motion.button
								type='submit'
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className='w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#C2185B]/25 text-sm font-bold text-white bg-[#C2185B] hover:bg-[#880E4F] focus:outline-none focus:ring-4 focus:ring-[#C2185B]/20 transition duration-300 disabled:opacity-50'
								disabled={loading || !agreed}
							>
								{loading ? (
									<>
										<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
										Creating account...
									</>
								) : (
									<>
										<UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
										Create Account
									</>
								)}
							</motion.button>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-[#F8BBD9]/50" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-4 bg-white text-gray-400">Or sign up with</span>
							</div>
						</div>

						{/* Social Login */}
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
							Already have an account?{" "}
							<Link to='/login' className='font-bold text-[#C2185B] hover:text-[#880E4F] transition-colors inline-flex items-center gap-1'>
								Login here <ArrowRight className='inline h-4 w-4' />
							</Link>
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default SignUpPage;