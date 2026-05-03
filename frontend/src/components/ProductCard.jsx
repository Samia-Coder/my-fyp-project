import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom"; // ← ADD
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
    const { user } = useUserStore();
    const { addToCart } = useCartStore();

    const handleAddToCart = (e) => {
        e.preventDefault(); // ← ADD: Link click na ho jab cart button dabao
        e.stopPropagation(); // ← ADD
        if (!user) {
            toast.error("Please login to add products to cart", { id: "login" });
            return;
        }
        addToCart(product);
    };

    return (
        <Link to={`/product/${product._id}`} className="group block"> {/* ← ADD: Link wrap */}
            <div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg hover:border-emerald-500 transition-all duration-300'>
                <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
                    <img className='object-cover w-full group-hover:scale-105 transition-transform duration-500' src={product.image} alt='product image' />
                    <div className='absolute inset-0 bg-black bg-opacity-20' />
                    
                    {/* Quick Add Button */}
                    <button
                        onClick={handleAddToCart}
                        className='absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>

                <div className='mt-4 px-5 pb-5'>
                    <h5 className='text-xl font-semibold tracking-tight text-white group-hover:text-emerald-400 transition-colors'>{product.name}</h5>
                    <div className='mt-2 mb-5 flex items-center justify-between'>
                        <p>
                            <span className='text-3xl font-bold text-emerald-400'>${product.price}</span>
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">({product.ratings?.count || 0})</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;