import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart, CreditCard, Truck, Shield, RotateCcw } from "lucide-react";
import { useState } from "react";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="bg-[#880E4F] text-white mt-20 relative overflow-hidden">
            {/* Decorative Wave */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
                <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#FFF5F7" opacity="1"></path>
                </svg>
            </div>

            {/* Trust Badges */}
            <div className="container mx-auto px-4 pt-20 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
                        { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
                        { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
                        { icon: CreditCard, title: "Best Prices", desc: "Guaranteed low prices" },
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-[#C2185B] rounded-xl flex items-center justify-center shrink-0">
                                <item.icon size={24} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{item.title}</h4>
                                <p className="text-xs text-white/70">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="bg-[#C2185B] rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">Stay in the Loop!</h3>
                            <p className="text-white/80">Subscribe for exclusive deals and new arrivals.</p>
                        </div>
                        <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C2185B]" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 rounded-full text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>
                            <button 
                                type="submit"
                                className="bg-[#880E4F] hover:bg-[#6a0b3d] text-white px-8 py-3 rounded-full font-medium transition-all hover:shadow-lg shrink-0"
                            >
                                {subscribed ? "Subscribed!" : "Subscribe"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-[#C2185B] font-bold text-xl">S</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Safira Mart</h2>
                                <p className="text-xs text-white/60">Premium Shopping</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/70 mb-4 leading-relaxed">
                            Your one-stop destination for premium quality products. We bring you the best deals with exceptional service.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-9 h-9 bg-white/20 hover:bg-[#C2185B] rounded-full flex items-center justify-center transition-all hover:scale-110">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="w-8 h-1 bg-[#C2185B] rounded-full" />
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {["Home", "Shop", "Categories", "Deals", "New Arrivals"].map((link) => (
                                <li key={link}>
                                    <Link to="/" className="text-sm text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#F8BBD9] rounded-full" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="w-8 h-1 bg-[#C2185B] rounded-full" />
                            Customer Service
                        </h3>
                        <ul className="space-y-3">
                            {["Contact Us", "FAQs", "Shipping Info", "Returns", "Size Guide"].map((link) => (
                                <li key={link}>
                                    <Link to="/" className="text-sm text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#F8BBD9] rounded-full" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="w-8 h-1 bg-[#C2185B] rounded-full" />
                            Contact Us
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#F8BBD9] shrink-0 mt-0.5" />
                                <span className="text-sm text-white/70">123 Shopping Street, Retail City, RC 12345</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-[#F8BBD9] shrink-0" />
                                <span className="text-sm text-white/70">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#F8BBD9] shrink-0" />
                                <span className="text-sm text-white/70">support@safiramart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-white/60 flex items-center gap-1">
                        © 2026 Safira Mart. Made with <Heart size={14} className="text-[#F8BBD9] fill-[#F8BBD9]" /> All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40">Visa</span>
                        <span className="text-xs text-white/40">Mastercard</span>
                        <span className="text-xs text-white/40">PayPal</span>
                    </div>
                </div>
            </div>

    
        </footer>
    );
};

export default Footer;