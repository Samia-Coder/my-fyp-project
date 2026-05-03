import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ShoppingBag, Sparkles, ArrowRight, Heart } from "lucide-react";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
	const { cart } = useCartStore();

	return (
		<div className='min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F5] py-8 md:py-16'>
			<div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
				{/* Page Header */}
				<motion.div 
					className="mb-10"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center gap-3 mb-2">
						<div className="p-2.5 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-xl shadow-lg shadow-[#C2185B]/20">
							<ShoppingCart size={24} className="text-white" />
						</div>
						<h1 className='text-3xl md:text-4xl font-black text-[#880E4F]'>
							Shopping Cart
						</h1>
					</div>
					<p className="text-gray-500 ml-14">
						{cart?.length || 0} {cart?.length === 1 ? 'item' : 'items'} in your cart
					</p>
				</motion.div>

				<div className='mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8'>
					<motion.div
						className='mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{!cart || cart.length === 0 ? (
							<EmptyCartUI />
						) : (
							<div className='space-y-5'>
								<AnimatePresence>
									{cart.map((item, idx) => (
										<motion.div
											key={item?._id || idx}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, x: -50 }}
											transition={{ delay: idx * 0.1 }}
										>
											<CartItem item={item} />
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						)}
						{cart?.length > 0 && <PeopleAlsoBought />}
					</motion.div>

					{cart?.length > 0 && (
						<motion.div
							className='mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							<OrderSummary />
							<GiftCouponCard />
							
							{/* Trust Badges */}
							<motion.div 
								className="bg-white rounded-2xl p-6 border border-[#F8BBD9]/30 shadow-lg"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
							>
								<div className="flex items-center gap-2 mb-4">
									<Sparkles size={18} className="text-[#C2185B]" />
									<h4 className="font-bold text-[#880E4F]">Why Shop With Us?</h4>
								</div>
								<div className="grid grid-cols-2 gap-3">
									{[
										{ icon: "🚚", text: "Free Shipping" },
										{ icon: "🔒", text: "Secure Payment" },
										{ icon: "↩️", text: "Easy Returns" },
										{ icon: "⭐", text: "Best Quality" },
									].map((item, idx) => (
										<motion.div 
											key={idx}
											whileHover={{ scale: 1.02 }}
											className="flex items-center gap-2 bg-[#FFF5F7] rounded-xl p-3 border border-[#F8BBD9]/20"
										>
											<span className="text-lg">{item.icon}</span>
											<span className="text-sm font-semibold text-[#880E4F]">{item.text}</span>
										</motion.div>
									))}
								</div>
							</motion.div>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CartPage;

const EmptyCartUI = () => (
	<motion.div
		className='flex flex-col items-center justify-center space-y-6 py-20'
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<motion.div
			animate={{ scale: [1, 1.05, 1] }}
			transition={{ duration: 2, repeat: Infinity }}
			className="relative"
		>
			<div className="w-32 h-32 bg-gradient-to-br from-[#FFF5F7] to-[#FCE4EC] rounded-full flex items-center justify-center">
				<ShoppingCart className='h-16 w-16 text-[#F8BBD9]' />
			</div>
			<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#C2185B] to-[#E91E63] rounded-full flex items-center justify-center text-white text-lg shadow-lg">
				0
			</div>
		</motion.div>
		
		<div className="text-center space-y-2">
			<h3 className='text-2xl font-black text-[#880E4F]'>Your cart is empty</h3>
			<p className='text-gray-400 max-w-sm'>
				Looks like you haven't added anything to your cart yet. Start exploring our amazing products!
			</p>
		</div>
		
		<Link to='/'>
			<motion.button
				className='mt-4 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] px-8 py-3.5 text-white font-bold shadow-lg shadow-[#C2185B]/30 flex items-center gap-2'
				whileHover={{ scale: 1.05, y: -2 }}
				whileTap={{ scale: 0.95 }}
			>
				<ShoppingBag size={20} />
				Start Shopping
				<ArrowRight size={18} />
			</motion.button>
		</Link>
		
		<div className="flex gap-4 mt-4">
			<Link to="/wishlist" className="flex items-center gap-2 text-[#C2185B] hover:text-[#880E4F] font-medium text-sm">
				<Heart size={16} />
				View Wishlist
			</Link>
		</div>
	</motion.div>
);