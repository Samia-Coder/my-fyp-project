import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Ruler, Weight, Calendar, Sparkles, Shirt, Monitor, 
    Home, Heart, Dumbbell, BookOpen, CheckCircle, ArrowRight,
    User, Info, RefreshCw, TrendingUp, Shield,
    Sun, Target, Palette, Award,
 
 
} from "lucide-react";
import toast from "react-hot-toast";

const SmartFitAdvisor = ({ isOpen, onClose, product }) => {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);

    const getSuggestions = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        const a = parseInt(age);
        
        if (!h || !w || !a) return null;

        const bmi = w / ((h / 100) ** 2);
        const mainCategory = product?.category?.main?.toLowerCase() || "";
        const subCategory = product?.category?.sub?.toLowerCase() || "";

        let result = {
            bmi: bmi.toFixed(1),
            category: "",
            size: "",
            fitType: "",
            recommendations: [],
            colorSuggestion: "",
            styleTip: "",
            healthNote: "",
            seasonalTip: "",
            budgetTip: "",
            whyThisMatters: ""
        };

        if (bmi < 18.5) result.category = "Underweight";
        else if (bmi < 25) result.category = "Normal";
        else if (bmi < 30) result.category = "Overweight";
        else result.category = "Obese";

        const isTall = h > 180;
        const isShort = h < 160;
        const isYoung = a < 25;
        const isMiddleAged = a >= 25 && a < 45;
        const isSenior = a >= 45;
        const isHeavy = w > 90;
        const isLight = w < 50;

        switch (mainCategory) {
            case "fashion":
                let size = "";
                let fitType = "";
                
                if (gender === "male") {
                    if (bmi < 20) { size = isTall ? "S Tall" : isShort ? "S Short" : "S"; fitType = "Slim Fit"; }
                    else if (bmi < 24) { size = isTall ? "M Tall" : isShort ? "M Short" : "M"; fitType = "Regular Fit"; }
                    else if (bmi < 28) { size = isTall ? "L Tall" : "L"; fitType = "Relaxed Fit"; }
                    else if (bmi < 32) { size = "XL"; fitType = "Loose Fit"; }
                    else { size = "XXL"; fitType = "Oversized Fit"; }
                } else {
                    if (bmi < 19) { size = isTall ? "XS Tall" : "XS"; fitType = "Petite Slim"; }
                    else if (bmi < 22) { size = isTall ? "S Tall" : "S"; fitType = "Regular Slim"; }
                    else if (bmi < 26) { size = isTall ? "M Tall" : "M"; fitType = "Regular Fit"; }
                    else if (bmi < 30) { size = "L"; fitType = "Comfort Fit"; }
                    else { size = "XL"; fitType = "Plus Size"; }
                }

                let styleProfile = isYoung ? "Gen Z Trendsetter" : isMiddleAged ? (bmi < 25 ? "Modern Professional" : "Smart Casual") : "Timeless Elegance";
                
                result.size = size;
                result.fitType = fitType;
                result.recommendations = [
                    `🎯 Perfect Size: ${size} (${fitType}) — Calculated from your BMI ${result.bmi}`,
                    `👤 Style Profile: ${styleProfile} — Curated for your age & body type`,
                    `📏 ${isShort ? "Pro Tip: High-waisted bottoms create longer leg illusion" : isTall ? "Pro Tip: Check inseam length (32-34 inch recommended)" : "Pro Tip: Standard fits work best for your height"}`,
                    `⚖️ ${bmi < 18.5 ? "Style Hack: Layer textures & patterns to add visual weight" : bmi < 25 ? "Style Hack: Experiment with trends — most styles flatter you!" : bmi < 30 ? "Style Hack: Vertical stripes & V-necks create slimming effect" : "Style Hack: Structured blazers define your silhouette beautifully"}`,
                    `🎨 Best Colors: ${isYoung ? (gender === "male" ? "Electric Blue, Neon Green" : "Hot Pink, Lavender") : isMiddleAged ? (gender === "male" ? "Navy, Charcoal" : "Burgundy, Teal") : (gender === "male" ? "Classic Black, Cream" : "Pearl White, Soft Gold")}`
                ];
                result.colorSuggestion = isYoung ? (gender === "male" ? "Electric Blue, Neon Green" : "Hot Pink, Lavender") : isMiddleAged ? (gender === "male" ? "Navy, Charcoal" : "Burgundy, Teal") : (gender === "male" ? "Classic Black, Cream" : "Pearl White, Soft Gold");
                result.styleTip = isHeavy ? "Structured blazers & tailored jackets polish your look instantly" : isLight ? "Bulky knits & layered looks add healthy dimension" : "Balance proportions: fitted top + straight-leg bottom = perfect combo";
                result.healthNote = "💡 Choose breathable fabrics (cotton, linen) for all-day comfort";
                result.seasonalTip = "🌟 Trending Now: " + (isYoung ? "Cargo pants & oversized shirts" : "Minimalist capsule wardrobes with statement pieces");
                result.budgetTip = "💰 Smart Buy: Invest in 3 quality basics vs 10 fast-fashion items";
                result.whyThisMatters = "Proper fit boosts confidence by 40% and improves posture";
                break;

            case "electronics":
                result.recommendations = [
                    `📱 ${isSenior ? "Senior-Friendly Pick: Large buttons, high contrast display, hearing aid compatible" : isYoung ? "Power User Pick: 120Hz display, RGB lighting, 65W fast charging" : "Productivity Pick: 16GB RAM, dual-monitor support, ergonomic keyboard"}`,
                    `💻 ${isTall ? "Setup Guide: 27+ inch monitor at eye level, mechanical keyboard with wrist rest" : isShort ? "Compact Setup: 13-14 inch laptop, portable stand, mini keyboard" : "Standard Setup: 15.6 inch laptop or 24 inch monitor with adjustable stand"}`,
                    `🎒 ${isHeavy ? "Durability Tip: Rugged cases & reinforced cables for long-term use" : "Portability Tip: Devices under 1.5kg for easy travel & commute"}`,
                    `👁️ ${bmi > 30 ? "Comfort Tech: Tablet with stand for couch use, wireless charging pad" : bmi < 18.5 ? "Active Lifestyle: Fitness tracker, wireless earbuds, action camera" : "Balanced Use: Standard accessories suit your versatile lifestyle"}`,
                    `🔋 ${subCategory.includes("phone") ? "Battery Life: " + (isYoung ? "5000mAh+ for gaming/streaming" : "4000mAh sufficient for daily use") : subCategory.includes("laptop") ? "Performance: " + (isHeavy ? "Gaming laptop with advanced cooling" : "Ultrabook under 1.3kg ideal") : "Check reviews from users with similar usage patterns"}`
                ];
                result.colorSuggestion = isYoung ? "Matte Black with RGB accents" : isMiddleAged ? "Space Gray or Midnight Blue" : "Classic Black with large, clear icons";
                result.styleTip = "💡 Dual-monitor setup increases productivity by 30-40%";
                result.healthNote = "👁️ 20-20-20 Rule: Every 20 min, look 20 feet away for 20 seconds";
                result.seasonalTip = "🎓 Back-to-School: Bundle deals save 15-20% on laptops + accessories";
                result.budgetTip = "💰 Refurbished flagships = 90% performance at 60% cost";
                result.whyThisMatters = "Right electronics reduce eye strain by 50% and boost efficiency";
                break;

            case "home & living":
                result.recommendations = [
                    `🛏️ ${isTall ? "Size Guide: King bed (80 inch length), 28 inch counter stools, raised countertops" : isShort ? "Compact Guide: Twin XL bed, 58 inch loveseat, step stools for kitchen" : "Standard Guide: Queen bed (60x80), 18 inch dining chairs, 36 inch counters"}`,
                    `💪 ${isHeavy ? "Heavy Duty: Reinforced bed frames (1000lb+), wide recliners (24 inch+ seats)" : "Lightweight: Easy-move furniture, stackable chairs, modular shelving"}`,
                    `♿ ${isSenior ? "Safety First: Lever handles, motion-sensor lights, grab bars in bathroom" : isYoung ? "Smart Home: Minimalist designs, multi-functional furniture, app-controlled lighting" : "Family Friendly: Stain-resistant fabrics, rounded corners, ample storage"}`,
                    `🛋️ ${bmi > 30 ? "Comfort Zone: 24+ inch seat depth, firm cushions for better support" : bmi < 18.5 ? "Cozy Corner: Plush cushions, memory foam toppers, soft throws" : "Balanced Comfort: Medium-firm seating for optimal support"}`,
                    `📏 ${subCategory.includes("bed") ? "Sleep Quality: " + (isHeavy ? "Firm mattress prevents back pain" : "Medium-soft for pressure relief") : "Space Check: Measure doorways (32 inch min) before ordering"}`
                ];
                result.colorSuggestion = isYoung ? "Mustard Yellow, Teal, Coral accents" : isMiddleAged ? "Beige, Greige, Soft White" : "Deep Navy, Forest Green, Rich Burgundy";
                result.styleTip = "📐 Always measure doorways & staircases before large furniture orders";
                result.healthNote = "🪑 Ergonomic chairs with lumbar support reduce back pain by 54%";
                result.seasonalTip = "🌸 Spring Refresh: Rotate mattresses & deep-clean upholstery every 6 months";
                result.budgetTip = "💰 Floor models & open-box = 30-50% savings with full warranty";
                result.whyThisMatters = "Proper furniture improves sleep quality by 60% and reduces body aches";
                break;

            case "beauty & health":
                result.recommendations = [
                    `✨ ${isYoung ? "Youth Routine: Salicylic acid for acne, SPF 50+ daily, gel moisturizers" : isMiddleAged ? "Anti-Aging: Retinol 0.5-1%, Vitamin C serum, peptide creams" : "Mature Care: Ceramide-rich creams, collagen supplements, gentle cleansers"}`,
                    `🧴 ${bmi > 30 ? "Body Care: Caffeine firming creams, dry brushing for circulation" : bmi < 18.5 ? "Hydration Boost: Body oils, shea butter, illuminating bronzers" : "Maintenance: Balanced moisturizer, weekly exfoliation, SPF protection"}`,
                    `👤 ${gender === "male" ? "Men's Care: Beard oil, matte moisturizer, aluminum-free deodorant" : "Women's Care: pH-balanced wash, silk pillowcases, heat patches"}`,
                    `📏 ${isTall ? "Value Size: 16oz+ lotions, large shampoo bottles for daily use" : isShort ? "Travel Friendly: TSA-approved sizes, mini sets for gym/purse" : "Standard Size: Regular bottles fit your usage pattern"}`,
                    `💊 ${bmi > 30 ? "Supplements: Omega-3 for inflammation, probiotics for gut health" : bmi < 18.5 ? "Supplements: Vitamin D3, B12 complex, iron if deficient" : "Supplements: Multivitamin, biotin for hair/skin, magnesium for sleep"}`
                ];
                result.colorSuggestion = isYoung ? "Coral, Peach, Mint packaging" : isMiddleAged ? "Rose Gold, White, Sage Green" : "Gold, Deep Purple, Black packaging";
                result.styleTip = "🧪 Patch test new products on inner arm for 24h before face use";
                result.healthNote = "⏰ Consistency wins: Daily simple routine beats sporadic intensive treatments";
                result.seasonalTip = "☀️ Summer Switch: Gel products, higher SPF, antioxidant serums for sun protection";
                result.budgetTip = "💰 The Ordinary & CeraVe = clinical ingredients at drugstore prices";
                result.whyThisMatters = "Consistent skincare reduces aging signs by 30% and prevents 80% of skin issues";
                break;

            case "sport & outdoor":
                result.recommendations = [
                    `🏃 ${bmi > 30 ? "Low Impact: Swimming, elliptical, water aerobics — gentle on joints" : bmi < 18.5 ? "Strength Build: Resistance bands, 5-10lb dumbbells, protein shakes" : "Cardio Mix: Running, cycling, HIIT 3x weekly for heart health"}`,
                    `🔥 ${isYoung ? "High Energy: CrossFit, martial arts, team sports for social fun" : isMiddleAged ? "Balanced: Strength 2x + cardio 3x weekly for metabolism boost" : "Gentle Movement: Tai chi, walking groups, golf for low-impact activity"}`,
                    `📏 ${isTall ? "Size Matters: 72+ inch yoga mats, XL bike frames (58cm+)" : isShort ? "Compact Gear: 68 inch mats, small bike frames (50-52cm)" : "Standard Fit: Regular sizes work for your height"}`,
                    `👟 ${isHeavy ? "Max Support: Motion control shoes, wide-fit (2E/4E), custom orthotics" : "Lightweight: Minimalist shoes under 250g, breathable mesh uppers"}`,
                    `👤 ${gender === "female" ? "Women's Gear: High-impact sports bras, women's-specific bike saddles" : "Men's Gear: Compression shorts, moisture-wicking layers, athletic cups"}`
                ];
                result.colorSuggestion = isYoung ? "Neon Yellow, Hot Pink for visibility" : isMiddleAged ? "Black with Red or Blue accents" : "Navy, White, Silver classic look";
                result.styleTip = "👟 Replace running shoes every 300-500 miles to prevent injury";
                result.healthNote = "🔥 Warm up 5-10 min before & stretch after every workout";
                result.seasonalTip = "❄️ Winter Layering: Moisture-wick base + insulating mid + windproof outer";
                result.budgetTip = "💰 End-of-season sales (Feb-Mar, Aug-Sep) = 40-60% off gear";
                result.whyThisMatters = "Right gear prevents 70% of sports injuries and improves performance by 25%";
                break;

            case "books & stationary":
                result.recommendations = [
                    `📚 ${isYoung ? "Gen Z Picks: Graphic novels, manga, career self-help, sci-fi" : isMiddleAged ? "Mid-Life Reads: Leadership bios, financial independence, skill guides" : "Classic Reads: Timeless novels, history, philosophy, memoirs"}`,
                    `🪑 ${bmi > 30 ? "Reading Setup: Wide armchair (28+ inch), lap desk, book stand" : "Digital Option: E-reader under 200g for comfortable long reading"}`,
                    `📝 ${isTall ? "Desk Setup: Standing desk converter (48+ inch), extended mouse pad" : isShort ? "Ergo Setup: Footrest, monitor riser, compact keyboard" : "Standard Setup: Regular desk height with ergonomic chair"}`,
                    `✍️ ${isHeavy ? "Writing Comfort: Ergonomic pens with cushioned grips" : "Fine Writing: Fountain pens, gel pens with 0.5mm precision tips"}`,
                    `🎓 ${gender === "female" && isYoung ? "Trending: Bullet journaling, washi tapes, romance novels" : gender === "male" && isYoung ? "Interests: Gaming guides, tech manuals, fitness books" : "Explore: Mix fiction & non-fiction for balanced knowledge"}`
                ];
                result.colorSuggestion = isYoung ? "Pastel pinks, sage greens, lavender" : isMiddleAged ? "Navy, Black, Burgundy leather-bound" : "Forest Green, Deep Brown, Gold embossing";
                result.styleTip = "🧠 Feynman Technique: Teach what you learn to retain 90% more";
                result.healthNote = "👁️ Reading Rule: Every 20 min, look 20 feet away for 20 seconds";
                result.seasonalTip = "🎒 Back to School (July-Aug): Bulk discounts on notebooks & backpacks";
                result.budgetTip = "💰 Libby & Hoopla apps = free e-books & audiobooks with library card";
                result.whyThisMatters = "Right study tools improve focus by 45% and reduce eye strain by 60%";
                break;

            default:
                result.recommendations = [
                    `📊 Your BMI ${result.bmi} indicates ${result.category} range — personalized for you`,
                    `📏 ${isTall ? "Above average height — check extended sizes" : isShort ? "Below average height — consider compact options" : "Standard height — regular sizes fit well"}`,
                    `⚖️ ${isHeavy ? "Heavy-duty construction recommended for durability" : isLight ? "Lightweight options ideal for easy handling" : "Standard weight capacity sufficient for your needs"}`,
                    `👤 ${isYoung ? "Trend-focused selections match your dynamic lifestyle" : isMiddleAged ? "Balanced quality & value for your established needs" : "Comfort & accessibility prioritized for ease of use"}`
                ];
                result.colorSuggestion = "Neutral palette with one accent color";
                result.styleTip = "Read reviews from users with similar body types for best results";
                result.healthNote = "Choose products supporting good posture & ergonomics";
                result.seasonalTip = "Holiday sales offer best discounts — plan purchases accordingly";
                result.budgetTip = "Compare prices across 3+ retailers before purchasing";
                result.whyThisMatters = "Personalized recommendations save 30% return rates and increase satisfaction";
        }

        return result;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!height || !weight || !age) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setSuggestions(getSuggestions());
            setLoading(false);
            toast.success("Personalized suggestions ready!");
        }, 1500);
    };

    const getCategoryIcon = () => {
        const cat = product?.category?.main?.toLowerCase() || "";
        switch (cat) {
            case "fashion": return <Shirt size={24} />;
            case "electronics": return <Monitor size={24} />;
            case "home & living": return <Home size={24} />;
            case "beauty & health": return <Heart size={24} />;
            case "sport & outdoor": return <Dumbbell size={24} />;
            case "books & stationary": return <BookOpen size={24} />;
            default: return <Sparkles size={24} />;
        }
    };

    const getBMIColor = (category) => {
        switch(category) {
            case "Normal": return "bg-emerald-500";
            case "Underweight": return "bg-yellow-500";
            case "Overweight": return "bg-orange-500";
            case "Obese": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const getBMIBgColor = (category) => {
        switch(category) {
            case "Normal": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Underweight": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "Overweight": return "bg-orange-50 text-orange-700 border-orange-200";
            case "Obese": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white border border-[#F8BBD9] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-[#880E4F] to-[#C2185B] p-6 rounded-t-3xl flex items-center justify-between shadow-lg z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl text-white backdrop-blur-sm">
                                {getCategoryIcon()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Smart Fit Advisor</h2>
                                <p className="text-sm text-[#F8BBD9] flex items-center gap-1">
                                    <Sparkles size={12} />
                                    {product?.category?.main} • {product?.category?.sub}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white backdrop-blur-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 bg-[#FFF5F7]/30">
                        {!suggestions ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Product Info Card */}
                                <div className="bg-white rounded-2xl p-4 border border-[#F8BBD9]/50 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-[#FFF5F7] border border-[#F8BBD9]/30 flex items-center justify-center text-[#C2185B]">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#E91E63] font-semibold uppercase tracking-wider">Product</p>
                                            <p className="text-[#880E4F] font-bold">{product?.name || "Selected Product"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-[#F8BBD9]/50 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={18} className="text-[#C2185B]" />
                                        <h3 className="font-bold text-[#880E4F]">Your Details</h3>
                                    </div>
                                    
                                    {/* Gender Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#880E4F]">Gender</label>
                                        <div className="flex gap-3">
                                            {["male", "female"].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setGender(g)}
                                                    className={`flex-1 py-3 px-4 rounded-xl capitalize transition-all duration-300 font-semibold shadow-sm ${
                                                        gender === g 
                                                            ? "bg-[#C2185B] text-white shadow-md transform scale-[1.02]" 
                                                            : "bg-[#FFF5F7] text-[#880E4F] hover:bg-[#F8BBD9]/30 border border-[#F8BBD9]/50"
                                                    }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inputs Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#880E4F] uppercase tracking-wider">
                                                <Ruler size={14} className="text-[#E91E63]" />
                                                Height
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={height}
                                                    onChange={(e) => setHeight(e.target.value)}
                                                    placeholder="175"
                                                    className="w-full bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl px-3 py-3 text-[#880E4F] placeholder-[#F8BBD9] focus:outline-none focus:border-[#C2185B] focus:bg-white transition text-center font-bold text-lg"
                                                    min="50"
                                                    max="250"
                                                    required
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#E91E63] font-medium">cm</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#880E4F] uppercase tracking-wider">
                                                <Weight size={14} className="text-[#E91E63]" />
                                                Weight
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    placeholder="70"
                                                    className="w-full bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl px-3 py-3 text-[#880E4F] placeholder-[#F8BBD9] focus:outline-none focus:border-[#C2185B] focus:bg-white transition text-center font-bold text-lg"
                                                    min="20"
                                                    max="300"
                                                    required
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#E91E63] font-medium">kg</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#880E4F] uppercase tracking-wider">
                                                <Calendar size={14} className="text-[#E91E63]" />
                                                Age
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value)}
                                                    placeholder="25"
                                                    className="w-full bg-[#FFF5F7] border-2 border-[#F8BBD9]/50 rounded-xl px-3 py-3 text-[#880E4F] placeholder-[#F8BBD9] focus:outline-none focus:border-[#C2185B] focus:bg-white transition text-center font-bold text-lg"
                                                    min="5"
                                                    max="120"
                                                    required
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#E91E63] font-medium">yrs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 bg-[#FFF5F7] rounded-xl p-3 border border-[#F8BBD9]/30">
                                        <Info size={16} className="text-[#E91E63] shrink-0 mt-0.5" />
                                        <p className="text-xs text-[#880E4F]/80 leading-relaxed">
                                            Enter your details accurately for the best personalized recommendations tailored to your body type.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#880E4F] to-[#C2185B] hover:from-[#C2185B] hover:to-[#880E4F] disabled:opacity-60 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            <span>Analyzing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Get My Perfect Fit
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-5"
                            >
                                {/* BMI Card */}
                                <div className="bg-white rounded-2xl p-5 border border-[#F8BBD9]/50 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp size={20} className="text-[#C2185B]" />
                                            <span className="font-bold text-[#880E4F]">Body Mass Index</span>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getBMIBgColor(suggestions.category)}`}>
                                            {suggestions.category}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-end gap-2 mb-3">
                                        <span className="text-5xl font-black text-[#880E4F]">{suggestions.bmi}</span>
                                        <span className="text-sm text-[#E91E63] font-medium mb-2">BMI Score</span>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="w-full bg-[#FFF5F7] rounded-full h-3 border border-[#F8BBD9]/30">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((suggestions.bmi / 40) * 100, 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-3 rounded-full ${getBMIColor(suggestions.category)} shadow-sm`}
                                            ></motion.div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] text-[#880E4F]/60 font-medium">
                                            <span>Underweight</span>
                                            <span>Normal</span>
                                            <span>Overweight</span>
                                            <span>Obese</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Why This Matters - NEW */}
                                {suggestions.whyThisMatters && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.05 }}
                                        className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] rounded-2xl p-4 text-white shadow-lg"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Award size={18} className="text-[#F8BBD9]" />
                                            <span className="text-xs font-bold text-[#F8BBD9] uppercase tracking-wider">Why This Matters</span>
                                        </div>
                                        <p className="text-sm font-medium">{suggestions.whyThisMatters}</p>
                                    </motion.div>
                                )}

                                {/* Size & Fit Card */}
                                {suggestions.size && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white rounded-2xl p-5 border-2 border-[#C2185B] shadow-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-[#E91E63] font-bold uppercase tracking-wider">Recommended Size</p>
                                                <p className="text-4xl font-black text-[#880E4F] mt-1">{suggestions.size}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[#E91E63] font-bold uppercase tracking-wider">Fit Type</p>
                                                <p className="text-lg font-bold text-[#C2185B] mt-1">{suggestions.fitType}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Recommendations */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-[#880E4F] flex items-center gap-2">
                                        <CheckCircle size={22} className="text-[#C2185B]" />
                                        Personalized Recommendations
                                    </h3>
                                    <div className="space-y-2">
                                        {suggestions.recommendations.map((rec, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#F8BBD9]/40 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-[#2D2D2D] text-sm leading-relaxed pt-1">{rec}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips Cards Grid */}
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Color Suggestion */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white rounded-xl p-4 border border-[#F8BBD9]/40 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Palette size={16} className="text-[#E91E63]" />
                                            <span className="text-xs font-bold text-[#880E4F] uppercase tracking-wider">Color Suggestion</span>
                                        </div>
                                        <p className="text-[#C2185B] font-semibold">{suggestions.colorSuggestion}</p>
                                    </motion.div>

                                    {/* Style Tip */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white rounded-xl p-4 border border-[#F8BBD9]/40 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={16} className="text-[#E91E63]" />
                                            <span className="text-xs font-bold text-[#880E4F] uppercase tracking-wider">Pro Style Tip</span>
                                        </div>
                                        <p className="text-[#2D2D2D] text-sm">{suggestions.styleTip}</p>
                                    </motion.div>

                                    {/* Health Note */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield size={16} className="text-emerald-600" />
                                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Health Note</span>
                                        </div>
                                        <p className="text-emerald-700 text-sm font-medium">{suggestions.healthNote}</p>
                                    </motion.div>

                                    {/* Seasonal Tip */}
                                    {suggestions.seasonalTip && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sun size={16} className="text-amber-600" />
                                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Seasonal Tip</span>
                                            </div>
                                            <p className="text-amber-700 text-sm font-medium">{suggestions.seasonalTip}</p>
                                        </motion.div>
                                    )}

                                    {/* Budget Tip */}
                                    {suggestions.budgetTip && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target size={16} className="text-blue-600" />
                                                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Budget Tip</span>
                                            </div>
                                            <p className="text-blue-700 text-sm font-medium">{suggestions.budgetTip}</p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Reset Button */}
                                <button
                                    onClick={() => {
                                        setSuggestions(null);
                                        setHeight("");
                                        setWeight("");
                                        setAge("");
                                    }}
                                    className="w-full bg-white hover:bg-[#FFF5F7] text-[#C2185B] py-4 rounded-2xl font-bold border-2 border-[#C2185B] transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md group"
                                >
                                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                    Check Another Product
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SmartFitAdvisor;