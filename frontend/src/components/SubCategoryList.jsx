import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SubCategoryList = ({ category, subcategories }) => {
    return (
        <div className="py-12 bg-[#FFF5F7]">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-[#C2185B] mb-2">{category.name}</h2>
                <p className="text-[#880E4F] mb-8">{category.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {subcategories.map((sub, index) => (
                        <motion.div
                            key={sub.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/category/${category.slug}/${sub.slug}`} className="group block">
                                <div className="relative overflow-hidden rounded-xl bg-white border border-[#F8BBD9] hover:border-[#E91E63] transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={sub.image || "/images/placeholder.jpg"}
                                            alt={sub.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-[#880E4F] group-hover:text-[#C2185B] transition-colors">
                                            {sub.name}
                                        </h3>
                                        <p className="text-sm text-[#C2185B] mt-1">Explore {sub.name}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubCategoryList;