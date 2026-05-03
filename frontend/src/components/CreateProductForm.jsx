import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Image, Tag, DollarSign, FileText, Layers } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";

const CreateProductForm = () => {
	const [newProduct, setNewProduct] = useState({
		name: "",
		description: "",
		price: "",
		category: {
			main: "",
			sub: ""
		},
		image: "",
	});

	const { createProduct, loading } = useProductStore();
	const { categories, fetchCategories } = useCategoryStore();

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await createProduct(newProduct);
			setNewProduct({
				name: "",
				description: "",
				price: "",
				category: { main: "", sub: "" },
				image: ""
			});
		} catch (error) {
			console.log("error creating a product", error);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setNewProduct({ ...newProduct, image: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const selectedCategory = categories.find(cat => cat.slug === newProduct.category.main);
	const subcategories = selectedCategory?.subcategories || [];

	return (
		<motion.div
			className="bg-white shadow-xl shadow-[#C2185B]/10 rounded-3xl p-8 mb-8 max-w-2xl mx-auto border border-[#F8BBD9]/30"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<div className="flex items-center gap-3 mb-8">
				<div className="w-12 h-12 bg-[#C2185B] rounded-xl flex items-center justify-center text-white">
					<PlusCircle size={24} />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-[#880E4F]">Create New Product</h2>
					<p className="text-sm text-gray-500">Add a new product to your store</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">

				{/* NAME */}
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-[#880E4F] mb-2">
						<Tag size={16} className="text-[#C2185B]" />
						Product Name
					</label>
					<input
						type="text"
						placeholder="Enter product name"
						value={newProduct.name}
						onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
						className="w-full bg-[#FFF5F7] text-[#2D2D2D] p-3 rounded-xl border-2 border-[#F8BBD9]/50 focus:border-[#C2185B] focus:outline-none focus:bg-white transition-all"
						required
					/>
				</div>

				{/* DESCRIPTION */}
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-[#880E4F] mb-2">
						<FileText size={16} className="text-[#C2185B]" />
						Description
					</label>
					<textarea
						placeholder="Enter product description"
						value={newProduct.description}
						onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
						className="w-full bg-[#FFF5F7] text-[#2D2D2D] p-3 rounded-xl border-2 border-[#F8BBD9]/50 focus:border-[#C2185B] focus:outline-none focus:bg-white transition-all"
						rows="3"
						required
					/>
				</div>

				{/* PRICE */}
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-[#880E4F] mb-2">
						<DollarSign size={16} className="text-[#C2185B]" />
						Price
					</label>
					<div className="relative">
						<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C2185B] font-bold">$</span>
						<input
							type="number"
							placeholder="0.00"
							value={newProduct.price}
							onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
							className="w-full bg-[#FFF5F7] text-[#2D2D2D] p-3 pl-10 rounded-xl border-2 border-[#F8BBD9]/50 focus:border-[#C2185B] focus:outline-none focus:bg-white transition-all"
							required
						/>
					</div>
				</div>

				{/* MAIN CATEGORY */}
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-[#880E4F] mb-2">
						<Layers size={16} className="text-[#C2185B]" />
						Main Category
					</label>
					<select
						value={newProduct.category.main}
						onChange={(e) =>
							setNewProduct({
								...newProduct,
								category: {
									main: e.target.value,
									sub: ""
								}
							})
						}
						className="w-full bg-[#FFF5F7] text-[#2D2D2D] p-3 rounded-xl border-2 border-[#F8BBD9]/50 focus:border-[#C2185B] focus:outline-none focus:bg-white transition-all"
						required
					>
						<option value="">Select Main Category</option>
						{categories.map((cat) => (
							<option key={cat.slug} value={cat.slug}>
								{cat.name}
							</option>
						))}
					</select>
				</div>

				{/* SUB CATEGORY */}
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-[#880E4F] mb-2">
						<Layers size={16} className="text-[#C2185B]" />
						Sub Category
					</label>
					<select
						value={newProduct.category.sub}
						onChange={(e) =>
							setNewProduct({
								...newProduct,
								category: {
									...newProduct.category,
									sub: e.target.value
								}
							})
						}
						className="w-full bg-[#FFF5F7] text-[#2D2D2D] p-3 rounded-xl border-2 border-[#F8BBD9]/50 focus:border-[#C2185B] focus:outline-none focus:bg-white transition-all"
						required
						disabled={!newProduct.category.main}
					>
						<option value="">
							{newProduct.category.main ? "Select Sub Category" : "First select main category"}
						</option>
						{subcategories.map((sub) => (
							<option key={sub.slug} value={sub.slug}>
								{sub.name}
							</option>
						))}
					</select>
				</div>

				{/* IMAGE */}
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-[#880E4F] mb-2">
						<Image size={16} className="text-[#C2185B]" />
						Product Image
					</label>
					<div className="flex items-center gap-3 p-4 bg-[#FFF5F7] rounded-xl border-2 border-dashed border-[#F8BBD9] hover:border-[#C2185B] transition-colors">
						<input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="text-gray-500 text-sm"
						/>
						{newProduct.image && (
							<span className="text-[#C2185B] text-sm font-medium flex items-center gap-1">
								<Upload size={14} /> Image selected
							</span>
						)}
					</div>
				</div>

				{/* PREVIEW */}
				{newProduct.image && (
					<div className="mt-2">
						<img src={newProduct.image} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-[#F8BBD9]" />
					</div>
				)}

				{/* SUBMIT */}
				<motion.button
					type="submit"
					disabled={loading}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className="w-full bg-[#C2185B] hover:bg-[#880E4F] text-white p-4 rounded-xl flex justify-center items-center transition-colors disabled:opacity-50 font-bold shadow-lg shadow-[#C2185B]/25"
				>
					{loading ? (
						<Loader className="animate-spin" />
					) : (
						<>
							<PlusCircle className="mr-2" />
							Create Product
						</>
					)}
				</motion.button>
			</form>
		</motion.div>
	);
};

export default CreateProductForm;