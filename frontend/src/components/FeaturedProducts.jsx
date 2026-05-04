import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";

const FeaturedProducts = ({ featuredProducts = [] }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);

	const { addToCart } = useCartStore();

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else if (window.innerWidth < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
	};

	const isStartDisabled = currentIndex === 0;
	const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

	return (
		<div className='py-16 bg-[#FFF5F7] relative overflow-hidden'>
			{/* Background decoration */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-[#E91E63] rounded-full filter blur-[150px] opacity-[0.03]" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C2185B] rounded-full filter blur-[150px] opacity-[0.03]" />
			
			<div className='container mx-auto px-4 relative z-10'>
				{/* Header */}
				<motion.div 
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="flex items-center justify-center gap-3 mb-4">
						<Sparkles className="w-8 h-8 text-[#E91E63]" />
						<h2 className='text-4xl sm:text-5xl font-black text-[#880E4F] tracking-tight'>
							Featured Products
						</h2>
						<Sparkles className="w-8 h-8 text-[#E91E63]" />
					</div>
					<div className="w-24 h-1 bg-gradient-to-r from-[#C2185B] to-[#E91E63] mx-auto rounded-full" />
				</motion.div>

				<div className='relative'>
					<div className='overflow-hidden px-2'>
						<div
							className='flex transition-transform duration-500 ease-out'
							style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
						>
							{Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
								featuredProducts.map((product) => (
									<div key={product._id} className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-3'>
										<motion.div 
											className='bg-white rounded-2xl shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-2xl border border-[#F8BBD9]/40 group'
											whileHover={{ y: -8 }}
										>
											<div className='overflow-hidden relative'>
												<img
													src={product.image}
													alt={product.name}
													className='w-full h-56 object-cover transition-transform duration-500 ease-out group-hover:scale-110'
												/>
												{/* Overlay gradient on hover */}
												<div className="absolute inset-0 bg-gradient-to-t from-[#C2185B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
												
												{/* Featured badge */}
												<div className="absolute top-3 left-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
													FEATURED
												</div>
											</div>
											
											<div className='p-5'>
												<h3 className='text-lg font-bold mb-2 text-[#2D2D2D] group-hover:text-[#C2185B] transition-colors'>
													{product.name}
												</h3>
												<p className='text-2xl font-black text-[#C2185B] mb-5'>
													${product.price.toFixed(2)}
												</p>
												<motion.button
													onClick={() => addToCart(product)}
													className='w-full bg-gradient-to-r from-[#C2185B] to-[#E91E63] hover:from-[#E91E63] hover:to-[#C2185B] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#C2185B]/30 hover:shadow-xl hover:shadow-[#C2185B]/40 flex items-center justify-center gap-2'
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													<ShoppingCart className='w-5 h-5' />
													Add to Cart
												</motion.button>
											</div>
										</motion.div>
									</div>
								))
							) : (
								<div className='w-full text-center py-16'>
									<div className="w-20 h-20 bg-[#FCE4EC] rounded-full flex items-center justify-center mx-auto mb-4">
										<Sparkles className="w-10 h-10 text-[#C2185B]" />
									</div>
									<p className='text-[#C2185B] font-medium text-lg'>No featured products available.</p>
								</div>
							)}
						</div>
					</div>

					{/* Navigation Buttons */}
					<button
						onClick={prevSlide}
						disabled={isStartDisabled}
						className={`absolute top-1/2 -left-2 sm:-left-6 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-300 ${
							isStartDisabled 
								? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
								: "bg-white text-[#C2185B] hover:bg-gradient-to-r hover:from-[#C2185B] hover:to-[#E91E63] hover:text-white hover:shadow-xl hover:shadow-[#C2185B]/30 hover:scale-110"
						}`}
					>
						<ChevronLeft className='w-6 h-6' />
					</button>

					<button
						onClick={nextSlide}
						disabled={isEndDisabled}
						className={`absolute top-1/2 -right-2 sm:-right-6 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-300 ${
							isEndDisabled 
								? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
								: "bg-white text-[#C2185B] hover:bg-gradient-to-r hover:from-[#C2185B] hover:to-[#E91E63] hover:text-white hover:shadow-xl hover:shadow-[#C2185B]/30 hover:scale-110"
						}`}
					>
						<ChevronRight className='w-6 h-6' />
					</button>
				</div>

				{/* Dots indicator */}
				{featuredProducts.length > itemsPerPage && (
					<div className="flex justify-center gap-2 mt-8">
						{Array.from({ length: Math.ceil(featuredProducts.length / itemsPerPage) }).map((_, idx) => (
							<button
								key={idx}
								onClick={() => setCurrentIndex(idx * itemsPerPage)}
								className={`w-2 h-2 rounded-full transition-all duration-300 ${
									idx === Math.floor(currentIndex / itemsPerPage)
										? "w-8 bg-gradient-to-r from-[#C2185B] to-[#E91E63]"
										: "bg-[#F8BBD9] hover:bg-[#C2185B]"
								}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default FeaturedProducts;