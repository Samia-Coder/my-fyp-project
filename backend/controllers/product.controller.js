import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({}); // find all products
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access

		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category } = req.body;

		let cloudinaryResponse = null;

		if (image) {
			cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "products",
			});
		}

		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url || "",
			category: {
				main: category?.main,
				sub: category?.sub,
			},
		});

		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloduinary");
			} catch (error) {
				console.log("error deleting image from cloduinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;

	try {
		const products = await Product.find({
			"category.main": category
		});

		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsBySubCategory = async (req, res) => {
	const { category, subcategory } = req.params;

	try {
		const query = {
			"category.main": category
		};

		if (subcategory) {
			query["category.sub"] = subcategory;
		}

		const products = await Product.find(query);

		res.json({ products });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function updateFeaturedProductsCache() {
	try {
		// The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in update cache function");
	}
}
export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === "") {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchTerm = q.trim().toLowerCase();
        
        // ============================================
        // COMPLETE RELATED WORDS MAPPING
        // ============================================
        
        const relatedWords = {
            // ========== 1. ELECTRONICS ==========
            "electronic": ["electronic", "electronics", "gadget", "device", "tech", "digital"],
            "electronics": ["electronic", "electronics", "gadget", "device", "tech", "digital"],
            "gadget": ["electronic", "electronics", "gadget", "device", "tech"],
            "device": ["electronic", "electronics", "gadget", "device", "tech"],
            "tech": ["electronic", "electronics", "gadget", "device", "tech", "technology"],
            "technology": ["electronic", "electronics", "gadget", "device", "tech", "technology"],
            "digital": ["electronic", "electronics", "digital", "gadget", "device"],
            
            // Mobile Phones
            "mobile": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset", "iphone", "samsung", "android", "xiaomi", "oppo", "vivo", "oneplus", "nokia"],
            "mobiles": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset", "iphone", "samsung", "android"],
            "phone": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset", "iphone", "samsung", "android", "telephone"],
            "phones": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset", "iphone", "samsung", "android"],
            "smartphone": ["mobile", "phone", "smartphone", "cell", "cellphone", "iphone", "samsung", "android"],
            "smartphones": ["mobile", "phone", "smartphone", "cell", "cellphone", "iphone", "samsung", "android"],
            "cell": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset"],
            "cellphone": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset"],
            "handset": ["mobile", "phone", "smartphone", "cell", "cellphone", "handset"],
            "iphone": ["mobile", "phone", "smartphone", "iphone", "apple", "ios"],
            "samsung": ["mobile", "phone", "smartphone", "samsung", "galaxy", "android"],
            "android": ["mobile", "phone", "smartphone", "android", "samsung", "google"],
            "xiaomi": ["mobile", "phone", "smartphone", "xiaomi", "redmi", "mi"],
            "redmi": ["mobile", "phone", "smartphone", "xiaomi", "redmi", "mi"],
            "oppo": ["mobile", "phone", "smartphone", "oppo", "android"],
            "vivo": ["mobile", "phone", "smartphone", "vivo", "android"],
            "oneplus": ["mobile", "phone", "smartphone", "oneplus", "android"],
            "nokia": ["mobile", "phone", "smartphone", "nokia"],
            
            // Laptops
            "laptop": ["laptop", "computer", "notebook", "macbook", "dell", "hp", "lenovo", "asus", "acer", "pc", "chromebook"],
            "laptops": ["laptop", "computer", "notebook", "macbook", "dell", "hp", "lenovo", "asus", "acer", "pc"],
            "computer": ["laptop", "computer", "desktop", "pc", "notebook", "macbook", "dell", "hp"],
            "computers": ["laptop", "computer", "desktop", "pc", "notebook", "macbook", "dell", "hp"],
            "notebook": ["laptop", "computer", "notebook", "macbook", "dell", "hp", "lenovo"],
            "notebooks": ["laptop", "computer", "notebook", "macbook", "dell", "hp", "lenovo"],
            "macbook": ["laptop", "computer", "notebook", "macbook", "apple", "mac"],
            "mac": ["laptop", "computer", "notebook", "macbook", "apple", "mac"],
            "dell": ["laptop", "computer", "notebook", "dell", "inspiron", "xps"],
            "hp": ["laptop", "computer", "notebook", "hp", "pavilion", "envy"],
            "lenovo": ["laptop", "computer", "notebook", "lenovo", "thinkpad", "ideapad"],
            "thinkpad": ["laptop", "computer", "notebook", "lenovo", "thinkpad"],
            "asus": ["laptop", "computer", "notebook", "asus", "vivobook", "zenbook"],
            "acer": ["laptop", "computer", "notebook", "acer", "aspire", "predator"],
            "chromebook": ["laptop", "computer", "notebook", "chromebook", "google"],
            "pc": ["laptop", "computer", "desktop", "pc", "notebook"],
            
            // Headphones
            "headphone": ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "headset", "airpods", "beats", "bose", "sennheiser", "audio"],
            "headphones": ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "headset", "airpods", "beats", "bose", "audio"],
            "earphone": ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "headset", "audio"],
            "earphones": ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "headset", "audio"],
            "earbud": ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "airpods", "wireless"],
            "earbuds": ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "airpods", "wireless"],
            "headset": ["headphone", "headphones", "headset", "gaming", "microphone", "audio"],
            "airpods": ["headphone", "headphones", "earbud", "earbuds", "airpods", "apple", "wireless"],
            "beats": ["headphone", "headphones", "beats", "dre", "audio"],
            "bose": ["headphone", "headphones", "bose", "speaker", "audio"],
            "sennheiser": ["headphone", "headphones", "sennheiser", "audio"],
            "audio": ["headphone", "headphones", "earphone", "speaker", "audio", "sound", "music"],
            "sound": ["headphone", "headphones", "speaker", "audio", "sound", "music"],
            "music": ["headphone", "headphones", "speaker", "audio", "sound", "music"],
            "wireless": ["headphone", "headphones", "earbud", "earbuds", "wireless", "bluetooth"],
            "bluetooth": ["headphone", "headphones", "earbud", "earbuds", "wireless", "bluetooth", "speaker"],
            
            // Camera
            "camera": ["camera", "cameras", "dslr", "mirrorless", "gopro", "canon", "nikon", "sony", "fujifilm", "photography", "video", "camcorder"],
            "cameras": ["camera", "cameras", "dslr", "mirrorless", "gopro", "canon", "nikon", "sony", "photography", "video"],
            "dslr": ["camera", "cameras", "dslr", "canon", "nikon", "photography", "lens"],
            "mirrorless": ["camera", "cameras", "mirrorless", "sony", "fujifilm", "photography"],
            "gopro": ["camera", "cameras", "gopro", "action", "video", "hero"],
            "canon": ["camera", "cameras", "dslr", "canon", "photography", "lens"],
            "nikon": ["camera", "cameras", "dslr", "nikon", "photography", "lens"],
            "sony": ["camera", "cameras", "mirrorless", "sony", "photography", "alpha"],
            "fujifilm": ["camera", "cameras", "mirrorless", "fujifilm", "photography"],
            "photography": ["camera", "cameras", "dslr", "mirrorless", "photography", "photo", "picture"],
            "photo": ["camera", "cameras", "photography", "photo", "picture", "image"],
            "video": ["camera", "cameras", "video", "camcorder", "recording", "gopro"],
            "camcorder": ["camera", "cameras", "video", "camcorder", "recording"],
            "lens": ["camera", "dslr", "mirrorless", "lens", "photography"],
            
            // Smart Watches
            "watch": ["watch", "watches", "smartwatch", "smartwatches", "fitbit", "apple watch", "garmin", "wearable"],
            "watches": ["watch", "watches", "smartwatch", "smartwatches", "fitbit", "apple watch", "garmin"],
            "smartwatch": ["watch", "watches", "smartwatch", "smartwatches", "fitbit", "apple watch", "garmin", "wearable"],
            "smartwatches": ["watch", "watches", "smartwatch", "smartwatches", "fitbit", "apple watch", "garmin"],
            "fitbit": ["watch", "watches", "smartwatch", "fitbit", "fitness tracker", "wearable"],
            "garmin": ["watch", "watches", "smartwatch", "garmin", "fitness", "gps"],
            "wearable": ["watch", "watches", "smartwatch", "fitbit", "wearable", "fitness tracker"],
            "apple watch": ["watch", "watches", "smartwatch", "apple watch", "apple", "wearable"],
            "fitness tracker": ["watch", "watches", "smartwatch", "fitbit", "fitness tracker", "wearable", "band"],
            
            // ========== 2. FASHION ==========
            "fashion": ["fashion", "clothing", "apparel", "wear", "style", "outfit", "dress", "garment"],
            "clothing": ["fashion", "clothing", "apparel", "wear", "dress", "shirt", "garment"],
            "apparel": ["fashion", "clothing", "apparel", "wear", "dress", "garment"],
            "wear": ["fashion", "clothing", "apparel", "wear", "dress", "garment"],
            "style": ["fashion", "clothing", "style", "trend", "outfit"],
            "outfit": ["fashion", "clothing", "outfit", "dress", "style"],
            "garment": ["fashion", "clothing", "apparel", "garment", "wear"],
            
            // Men
            "men": ["men", "mens", "man", "male", "gentleman", "guys", "boys", "gent"],
            "mens": ["men", "mens", "man", "male", "gentleman", "guys", "boys"],
            "man": ["men", "mens", "man", "male", "gentleman", "guy"],
            "male": ["men", "mens", "man", "male", "gentleman", "guy"],
            "gentleman": ["men", "mens", "man", "male", "gentleman", "gent"],
            "guys": ["men", "mens", "man", "male", "guys", "boys"],
            "boys": ["men", "mens", "boys", "boy", "male", "kids"],
            
            // Women
            "women": ["women", "womens", "woman", "female", "lady", "ladies", "girls", "feminine"],
            "womens": ["women", "womens", "woman", "female", "lady", "ladies", "girls"],
            "woman": ["women", "womens", "woman", "female", "lady", "girl"],
            "female": ["women", "womens", "woman", "female", "lady", "girl"],
            "lady": ["women", "womens", "woman", "female", "lady", "ladies"],
            "ladies": ["women", "womens", "woman", "female", "lady", "ladies", "girls"],
            "girls": ["women", "womens", "girls", "girl", "female", "kids"],
            "feminine": ["women", "womens", "woman", "female", "feminine", "lady"],
            
            // Kids
            "kids": ["kids", "kid", "children", "child", "baby", "toddler", "infant", "boys", "girls", "teen"],
            "kid": ["kids", "kid", "children", "child", "baby", "toddler"],
            "children": ["kids", "kid", "children", "child", "baby", "toddler", "infant"],
            "child": ["kids", "kid", "children", "child", "baby", "toddler"],
            "baby": ["kids", "kid", "children", "child", "baby", "toddler", "infant", "newborn"],
            "toddler": ["kids", "kid", "children", "child", "baby", "toddler"],
            "infant": ["kids", "kid", "children", "child", "baby", "infant", "newborn"],
            "newborn": ["kids", "kid", "children", "child", "baby", "infant", "newborn"],
            "teen": ["kids", "kid", "children", "teen", "teenager", "youth"],
            "teenager": ["kids", "kid", "children", "teen", "teenager", "youth"],
            "youth": ["kids", "kid", "children", "teen", "teenager", "youth"],
            
            // Shoes
            "shoe": ["shoe", "shoes", "footwear", "sneaker", "sneakers", "boot", "boots", "sandal", "sandals", "slipper", "slippers", "nike", "adidas", "puma", "reebok"],
            "shoes": ["shoe", "shoes", "footwear", "sneaker", "sneakers", "boot", "boots", "sandal", "sandals", "slipper", "slippers"],
            "footwear": ["shoe", "shoes", "footwear", "sneaker", "boot", "sandal", "slipper"],
            "sneaker": ["shoe", "shoes", "sneaker", "sneakers", "running", "jogging", "nike", "adidas"],
            "sneakers": ["shoe", "shoes", "sneaker", "sneakers", "running", "jogging", "nike", "adidas"],
            "boot": ["shoe", "shoes", "boot", "boots", "footwear", "leather"],
            "boots": ["shoe", "shoes", "boot", "boots", "footwear", "leather"],
            "sandal": ["shoe", "shoes", "sandal", "sandals", "slipper", "flip flop"],
            "sandals": ["shoe", "shoes", "sandal", "sandals", "slipper", "flip flop"],
            "slipper": ["shoe", "shoes", "slipper", "slippers", "sandal", "flip flop", "home"],
            "slippers": ["shoe", "shoes", "slipper", "slippers", "sandal", "flip flop", "home"],
            "flip flop": ["shoe", "shoes", "sandal", "slipper", "flip flop", "flipflop"],
            "flipflop": ["shoe", "shoes", "sandal", "slipper", "flip flop", "flipflop"],
            "nike": ["shoe", "shoes", "sneaker", "sneakers", "nike", "sport", "running"],
            "adidas": ["shoe", "shoes", "sneaker", "sneakers", "adidas", "sport", "running"],
            "puma": ["shoe", "shoes", "sneaker", "sneakers", "puma", "sport"],
            "reebok": ["shoe", "shoes", "sneaker", "sneakers", "reebok", "sport"],
            "running": ["shoe", "shoes", "sneaker", "sneakers", "running", "jogging", "sport"],
            "jogging": ["shoe", "shoes", "sneaker", "sneakers", "running", "jogging", "sport"],
            
            // Accessories
            "accessory": ["accessory", "accessories", "bag", "bags", "wallet", "belt", "watch", "jewelry", "sunglasses", "hat", "cap", "scarf", "gloves"],
            "accessories": ["accessory", "accessories", "bag", "bags", "wallet", "belt", "watch", "jewelry", "sunglasses", "hat", "cap", "scarf"],
            "bag": ["accessory", "accessories", "bag", "bags", "handbag", "purse", "backpack", "tote", "clutch"],
            "bags": ["accessory", "accessories", "bag", "bags", "handbag", "purse", "backpack", "tote"],
            "handbag": ["accessory", "accessories", "bag", "bags", "handbag", "purse", "tote", "clutch"],
            "purse": ["accessory", "accessories", "bag", "bags", "handbag", "purse", "wallet"],
            "backpack": ["accessory", "accessories", "bag", "bags", "backpack", "school", "travel"],
            "wallet": ["accessory", "accessories", "wallet", "purse", "money", "card"],
            "belt": ["accessory", "accessories", "belt", "leather", "fashion"],
            "jewelry": ["accessory", "accessories", "jewelry", "jewellery", "ring", "necklace", "bracelet", "earring", "gold", "silver", "diamond"],
            "jewellery": ["accessory", "accessories", "jewelry", "jewellery", "ring", "necklace", "bracelet", "earring"],
            "ring": ["accessory", "accessories", "jewelry", "jewellery", "ring", "gold", "silver", "diamond"],
            "necklace": ["accessory", "accessories", "jewelry", "jewellery", "necklace", "chain", "pendant"],
            "bracelet": ["accessory", "accessories", "jewelry", "jewellery", "bracelet", "bangle"],
            "earring": ["accessory", "accessories", "jewelry", "jewellery", "earring", "earrings"],
            "earrings": ["accessory", "accessories", "jewelry", "jewellery", "earring", "earrings"],
            "gold": ["accessory", "accessories", "jewelry", "jewellery", "gold", "ornament"],
            "silver": ["accessory", "accessories", "jewelry", "jewellery", "silver", "ornament"],
            "diamond": ["accessory", "accessories", "jewelry", "jewellery", "diamond", "gem"],
            "sunglasses": ["accessory", "accessories", "sunglasses", "goggles", "shade", "eyewear", "glass"],
            "goggles": ["accessory", "accessories", "sunglasses", "goggles", "eyewear"],
            "eyewear": ["accessory", "accessories", "sunglasses", "goggles", "eyewear", "glass"],
            "hat": ["accessory", "accessories", "hat", "hats", "cap", "caps", "headwear"],
            "hats": ["accessory", "accessories", "hat", "hats", "cap", "caps"],
            "cap": ["accessory", "accessories", "hat", "hats", "cap", "caps", "headwear"],
            "caps": ["accessory", "accessories", "hat", "hats", "cap", "caps"],
            "scarf": ["accessory", "accessories", "scarf", "scarves", "shawl", "wrap"],
            "scarves": ["accessory", "accessories", "scarf", "scarves", "shawl"],
            "gloves": ["accessory", "accessories", "gloves", "glove", "mittens", "hand"],
            
            // ========== 3. HOME AND LIVING ==========
            "home": ["home", "house", "living", "household", "domestic", "interior"],
            "house": ["home", "house", "living", "household", "domestic"],
            "living": ["home", "house", "living", "household", "lifestyle"],
            "household": ["home", "house", "living", "household", "domestic"],
            "interior": ["home", "house", "interior", "decor", "design", "furniture"],
            
            // Furniture
            "furniture": ["furniture", "furnishing", "table", "chair", "sofa", "couch", "bed", "desk", "wardrobe", "cabinet", "shelf", "bookshelf", "dresser"],
            "furnishing": ["furniture", "furnishing", "home decor", "interior"],
            "table": ["furniture", "table", "tables", "dining", "coffee", "side"],
            "tables": ["furniture", "table", "tables", "dining", "coffee"],
            "chair": ["furniture", "chair", "chairs", "seating", "dining"],
            "chairs": ["furniture", "chair", "chairs", "seating"],
            "sofa": ["furniture", "sofa", "sofas", "couch", "couches", "lounge", "settee"],
            "sofas": ["furniture", "sofa", "sofas", "couch", "couches"],
            "couch": ["furniture", "sofa", "sofas", "couch", "couches", "lounge"],
            "couches": ["furniture", "sofa", "sofas", "couch", "couches"],
            "bed": ["furniture", "bed", "beds", "mattress", "bedroom", "bunk"],
            "beds": ["furniture", "bed", "beds", "mattress", "bedroom"],
            "mattress": ["furniture", "bed", "beds", "mattress", "sleep"],
            "desk": ["furniture", "desk", "desks", "study", "office", "work"],
            "wardrobe": ["furniture", "wardrobe", "closet", "cupboard", "almirah", "storage"],
            "closet": ["furniture", "wardrobe", "closet", "cupboard", "storage"],
            "cupboard": ["furniture", "wardrobe", "closet", "cupboard", "cabinet", "storage"],
            "cabinet": ["furniture", "cabinet", "cabinets", "cupboard", "storage"],
            "shelf": ["furniture", "shelf", "shelves", "bookshelf", "rack", "storage"],
            "shelves": ["furniture", "shelf", "shelves", "bookshelf", "rack"],
            "bookshelf": ["furniture", "shelf", "shelves", "bookshelf", "bookcase"],
            "bookcase": ["furniture", "shelf", "shelves", "bookshelf", "bookcase"],
            "dresser": ["furniture", "dresser", "drawer", "chest"],
            "drawer": ["furniture", "dresser", "drawer", "chest", "storage"],
            "lounge": ["furniture", "sofa", "couch", "lounge", "living"],
            "seating": ["furniture", "chair", "sofa", "couch", "seating", "bench"],
            "bench": ["furniture", "bench", "seating", "chair"],
            
            // Kitchen
            "kitchen": ["kitchen", "cooking", "cookware", "utensil", "appliance", "dining", "chef", "food"],
            "cooking": ["kitchen", "cooking", "cookware", "utensil", "chef", "food"],
            "cookware": ["kitchen", "cooking", "cookware", "pot", "pan", "utensil"],
            "utensil": ["kitchen", "cooking", "utensil", "utensils", "tool", "spoon", "fork", "knife"],
            "utensils": ["kitchen", "cooking", "utensil", "utensils", "spoon", "fork", "knife"],
            "pot": ["kitchen", "cooking", "cookware", "pot", "pan", "saucepan"],
            "pan": ["kitchen", "cooking", "cookware", "pot", "pan", "frying"],
            "saucepan": ["kitchen", "cooking", "cookware", "pot", "saucepan"],
            "spoon": ["kitchen", "utensil", "utensils", "spoon", "fork", "knife", "cutlery"],
            "fork": ["kitchen", "utensil", "utensils", "spoon", "fork", "knife", "cutlery"],
            "knife": ["kitchen", "utensil", "utensils", "knife", "knives", "cutlery", "chopper"],
            "knives": ["kitchen", "utensil", "utensils", "knife", "knives", "cutlery"],
            "cutlery": ["kitchen", "utensil", "utensils", "spoon", "fork", "knife", "cutlery"],
            "appliance": ["kitchen", "appliance", "appliances", "blender", "mixer", "toaster", "microwave", "oven", "fridge", "refrigerator"],
            "appliances": ["kitchen", "appliance", "appliances", "blender", "mixer", "toaster", "microwave"],
            "blender": ["kitchen", "appliance", "appliances", "blender", "mixer", "juicer"],
            "mixer": ["kitchen", "appliance", "appliances", "blender", "mixer", "grinder"],
            "grinder": ["kitchen", "appliance", "appliances", "mixer", "grinder"],
            "juicer": ["kitchen", "appliance", "appliances", "blender", "juicer"],
            "toaster": ["kitchen", "appliance", "appliances", "toaster", "bread"],
            "microwave": ["kitchen", "appliance", "appliances", "microwave", "oven"],
            "oven": ["kitchen", "appliance", "appliances", "oven", "microwave", "baking"],
            "fridge": ["kitchen", "appliance", "fridge", "refrigerator", "freezer", "cooler"],
            "refrigerator": ["kitchen", "appliance", "fridge", "refrigerator", "freezer"],
            "freezer": ["kitchen", "appliance", "fridge", "refrigerator", "freezer"],
            "chef": ["kitchen", "cooking", "chef", "culinary", "gourmet"],
            "food": ["kitchen", "cooking", "food", "culinary", "dining"],
            "dining": ["kitchen", "dining", "table", "dinner", "eat"],
            
            // Bedding
            "bedding": ["bedding", "bedsheet", "bedsheets", "pillow", "pillows", "blanket", "blankets", "quilt", "comforter", "duvet", "mattress", "sleep"],
            "bedsheet": ["bedding", "bedsheet", "bedsheets", "sheet", "sheets", "linen"],
            "bedsheets": ["bedding", "bedsheet", "bedsheets", "sheet", "sheets"],
            "sheet": ["bedding", "bedsheet", "bedsheets", "sheet", "sheets", "linen"],
            "sheets": ["bedding", "bedsheet", "bedsheets", "sheet", "sheets"],
            "pillow": ["bedding", "pillow", "pillows", "cushion", "cushions"],
            "pillows": ["bedding", "pillow", "pillows", "cushion", "cushions"],
            "cushion": ["bedding", "pillow", "pillows", "cushion", "cushions", "throw"],
            "cushions": ["bedding", "pillow", "pillows", "cushion", "cushions"],
            "blanket": ["bedding", "blanket", "blankets", "throw", "quilt", "comforter"],
            "blankets": ["bedding", "blanket", "blankets", "throw", "quilt"],
            "quilt": ["bedding", "blanket", "blankets", "quilt", "comforter", "duvet"],
            "comforter": ["bedding", "blanket", "blankets", "quilt", "comforter", "duvet"],
            "duvet": ["bedding", "blanket", "blankets", "quilt", "comforter", "duvet"],
            "throw": ["bedding", "blanket", "blankets", "throw", "cushion"],
            "linen": ["bedding", "bedsheet", "sheet", "linen", "fabric", "cotton"],
            "sleep": ["bedding", "sleep", "mattress", "pillow", "rest"],
            
            // Decor
            "decor": ["decor", "decoration", "decorative", "home decor", "interior", "design", "ornament", "showpiece", "vase", "candle", "wall art", "frame", "mirror", "clock", "lamp", "light"],
            "decoration": ["decor", "decoration", "decorative", "home decor", "ornament", "showpiece"],
            "decorative": ["decor", "decoration", "decorative", "home decor", "ornament"],
            "ornament": ["decor", "decoration", "ornament", "ornaments", "showpiece", "figurine"],
            "ornaments": ["decor", "decoration", "ornament", "ornaments", "showpiece"],
            "showpiece": ["decor", "decoration", "ornament", "showpiece", "figurine", "statue"],
            "figurine": ["decor", "decoration", "ornament", "showpiece", "figurine", "statue"],
            "statue": ["decor", "decoration", "ornament", "showpiece", "figurine", "statue", "sculpture"],
            "sculpture": ["decor", "decoration", "statue", "sculpture", "art"],
            "vase": ["decor", "decoration", "vase", "flower", "pot", "centerpiece"],
            "flower": ["decor", "decoration", "vase", "flower", "plant", "bouquet", "artificial"],
            "plant": ["decor", "decoration", "plant", "flower", "pot", "indoor"],
            "candle": ["decor", "decoration", "candle", "candles", "scented", "aroma", "light"],
            "candles": ["decor", "decoration", "candle", "candles", "scented", "aroma"],
            "scented": ["decor", "decoration", "candle", "candles", "scented", "aroma", "fragrance"],
            "aroma": ["decor", "decoration", "candle", "scented", "aroma", "fragrance", "diffuser"],
            "wall art": ["decor", "decoration", "wall art", "painting", "poster", "wallpaper", "sticker"],
            "painting": ["decor", "decoration", "wall art", "painting", "art", "canvas"],
            "poster": ["decor", "decoration", "wall art", "poster", "print"],
            "wallpaper": ["decor", "decoration", "wall art", "wallpaper", "wall sticker"],
            "frame": ["decor", "decoration", "frame", "frames", "photo frame", "picture"],
            "frames": ["decor", "decoration", "frame", "frames", "photo frame"],
            "photo frame": ["decor", "decoration", "frame", "frames", "photo frame", "picture"],
            "mirror": ["decor", "decoration", "mirror", "mirrors", "wall mirror", "vanity"],
            "mirrors": ["decor", "decoration", "mirror", "mirrors", "wall mirror"],
            "clock": ["decor", "decoration", "clock", "clocks", "wall clock", "alarm"],
            "clocks": ["decor", "decoration", "clock", "clocks", "wall clock"],
            "wall clock": ["decor", "decoration", "clock", "clocks", "wall clock"],
            "lamp": ["decor", "decoration", "lamp", "lamps", "light", "lighting", "table lamp", "floor lamp"],
            "lamps": ["decor", "decoration", "lamp", "lamps", "light", "lighting"],
            "light": ["decor", "decoration", "lamp", "lamps", "light", "lighting", "bulb", "led"],
            "lighting": ["decor", "decoration", "lamp", "lamps", "light", "lighting", "fixture"],
            "bulb": ["decor", "decoration", "light", "lighting", "bulb", "led"],
            "led": ["decor", "decoration", "light", "lighting", "bulb", "led"],
            
            // ========== 4. BEAUTY AND HEALTH ==========
            "beauty": ["beauty", "beautiful", "gorgeous", "pretty", "skincare", "makeup", "cosmetic", "glamour"],
            "beautiful": ["beauty", "beautiful", "gorgeous", "pretty", "glamour"],
            "gorgeous": ["beauty", "beautiful", "gorgeous", "pretty"],
            "pretty": ["beauty", "beautiful", "gorgeous", "pretty"],
            "glamour": ["beauty", "glamour", "glamorous", "makeup", "fashion"],
            "glamorous": ["beauty", "glamour", "glamorous", "makeup"],
            
            // Makeup
            "makeup": ["makeup", "make up", "cosmetic", "cosmetics", "beauty product", "lipstick", "lipgloss", "foundation", "concealer", "mascara", "eyeliner", "eyeshadow", "blush", "powder", "compact", "primer", "bb cream", "cc cream", "contour", "highlighter", "bronzer"],
            "make up": ["makeup", "make up", "cosmetic", "cosmetics", "beauty product"],
            "cosmetic": ["makeup", "cosmetic", "cosmetics", "beauty product", "lipstick", "foundation"],
            "cosmetics": ["makeup", "cosmetic", "cosmetics", "beauty product", "lipstick", "foundation"],
            "lipstick": ["makeup", "cosmetic", "cosmetics", "lipstick", "lip color", "lip gloss", "lip balm", "lip tint"],
            "lip color": ["makeup", "cosmetic", "lipstick", "lip color", "lip gloss"],
            "lip gloss": ["makeup", "cosmetic", "lipstick", "lip color", "lip gloss", "lipgloss"],
            "lipgloss": ["makeup", "cosmetic", "lipstick", "lip color", "lip gloss", "lipgloss"],
            "lip balm": ["makeup", "cosmetic", "lipstick", "lip balm", "lipcare"],
            "lip tint": ["makeup", "cosmetic", "lipstick", "lip color", "lip tint"],
            "foundation": ["makeup", "cosmetic", "cosmetics", "foundation", "base", "bb cream", "cc cream", "primer"],
            "base": ["makeup", "cosmetic", "foundation", "base", "primer"],
            "concealer": ["makeup", "cosmetic", "concealer", "cover", "hide", "spot"],
            "mascara": ["makeup", "cosmetic", "mascara", "lash", "eyelash", "eye"],
            "lash": ["makeup", "cosmetic", "mascara", "lash", "eyelash", "false lash"],
            "eyelash": ["makeup", "cosmetic", "mascara", "lash", "eyelash"],
            "false lash": ["makeup", "cosmetic", "lash", "false lash", "falsies"],
            "falsies": ["makeup", "cosmetic", "lash", "false lash", "falsies"],
            "eyeliner": ["makeup", "cosmetic", "eyeliner", "kajal", "eye pencil", "eye"],
            "kajal": ["makeup", "cosmetic", "eyeliner", "kajal", "eye"],
            "eye pencil": ["makeup", "cosmetic", "eyeliner", "eye pencil", "eye"],
            "eyeshadow": ["makeup", "cosmetic", "eyeshadow", "eye shadow", "eye palette", "eye"],
            "eye shadow": ["makeup", "cosmetic", "eyeshadow", "eye shadow", "eye palette"],
            "eye palette": ["makeup", "cosmetic", "eyeshadow", "eye shadow", "eye palette"],
            "blush": ["makeup", "cosmetic", "blush", "cheek", "rosy", "flush"],
            "cheek": ["makeup", "cosmetic", "blush", "cheek", "contour"],
            "powder": ["makeup", "cosmetic", "powder", "compact", "loose powder", "setting powder"],
            "compact": ["makeup", "cosmetic", "powder", "compact", "pressed powder"],
            "loose powder": ["makeup", "cosmetic", "powder", "loose powder", "setting powder"],
            "setting powder": ["makeup", "cosmetic", "powder", "loose powder", "setting powder"],
            "primer": ["makeup", "cosmetic", "primer", "base", "foundation"],
            "bb cream": ["makeup", "cosmetic", "bb cream", "blemish balm", "foundation"],
            "cc cream": ["makeup", "cosmetic", "cc cream", "color correct", "foundation"],
            "contour": ["makeup", "cosmetic", "contour", "contouring", "sculpt", "face"],
            "contouring": ["makeup", "cosmetic", "contour", "contouring", "sculpt"],
            "highlighter": ["makeup", "cosmetic", "highlighter", "highlight", "glow", "shimmer"],
            "highlight": ["makeup", "cosmetic", "highlighter", "highlight", "glow"],
            "bronzer": ["makeup", "cosmetic", "bronzer", "bronze", "tan", "contour"],
            "glow": ["makeup", "cosmetic", "highlighter", "glow", "shimmer", "radiant"],
            "shimmer": ["makeup", "cosmetic", "highlighter", "glow", "shimmer", "glitter"],
            "glitter": ["makeup", "cosmetic", "shimmer", "glitter", "sparkle"],
            "nail": ["makeup", "cosmetic", "nail", "nails", "nail polish", "manicure", "pedicure"],
            "nails": ["makeup", "cosmetic", "nail", "nails", "nail polish", "manicure"],
            "nail polish": ["makeup", "cosmetic", "nail", "nails", "nail polish", "nail paint"],
            "nail paint": ["makeup", "cosmetic", "nail", "nails", "nail polish", "nail paint"],
            "manicure": ["makeup", "cosmetic", "nail", "nails", "manicure", "hand"],
            "pedicure": ["makeup", "cosmetic", "nail", "nails", "pedicure", "foot"],
            "remover": ["makeup", "cosmetic", "remover", "makeup remover", "cleanser", "micellar"],
            "makeup remover": ["makeup", "cosmetic", "remover", "makeup remover", "cleanser"],
            "setting spray": ["makeup", "cosmetic", "setting spray", "fixer", "setting"],
            "fixer": ["makeup", "cosmetic", "setting spray", "fixer", "setting"],
            "brush": ["makeup", "cosmetic", "brush", "brushes", "makeup brush", "applicator", "sponge", "beauty blender"],
            "brushes": ["makeup", "cosmetic", "brush", "brushes", "makeup brush"],
            "makeup brush": ["makeup", "cosmetic", "brush", "brushes", "makeup brush"],
            "sponge": ["makeup", "cosmetic", "sponge", "beauty blender", "applicator"],
            "beauty blender": ["makeup", "cosmetic", "sponge", "beauty blender", "applicator"],
            "applicator": ["makeup", "cosmetic", "brush", "sponge", "applicator"],
            "palette": ["makeup", "cosmetic", "palette", "eyeshadow palette", "makeup kit"],
            "makeup kit": ["makeup", "cosmetic", "palette", "makeup kit", "set"],
            
            // Skin Care
            "skincare": ["skincare", "skin care", "skin", "face", "facial", "cleanser", "face wash", "moisturizer", "cream", "lotion", "serum", "toner", "sunscreen", "spf", "anti aging", "acne", "pimple", "dark circle", "face mask", "scrub", "exfoliate"],
            "skin care": ["skincare", "skin care", "skin", "face", "facial", "cleanser"],
            "skin": ["skincare", "skin care", "skin", "face", "body", "complexion"],
            "face": ["skincare", "skin care", "skin", "face", "facial", "cleanser"],
            "facial": ["skincare", "skin care", "skin", "face", "facial", "cleanser", "face pack"],
            "cleanser": ["skincare", "skin care", "cleanser", "face wash", "cleaning", "face cleanser"],
            "face wash": ["skincare", "skin care", "cleanser", "face wash", "facewash", "cleaning"],
            "facewash": ["skincare", "skin care", "cleanser", "face wash", "facewash"],
            "moisturizer": ["skincare", "skin care", "moisturizer", "moisturiser", "cream", "lotion", "hydrating"],
            "moisturiser": ["skincare", "skin care", "moisturizer", "moisturiser", "cream", "lotion"],
            "cream": ["skincare", "skin care", "moisturizer", "cream", "lotion", "ointment"],
            "lotion": ["skincare", "skin care", "moisturizer", "cream", "lotion", "body lotion"],
            "body lotion": ["skincare", "skin care", "lotion", "body lotion", "moisturizer"],
            "serum": ["skincare", "skin care", "serum", "essence", "concentrate", "ampoule"],
            "essence": ["skincare", "skin care", "serum", "essence", "concentrate"],
            "toner": ["skincare", "skin care", "toner", "astringent", "face toner"],
            "astringent": ["skincare", "skin care", "toner", "astringent"],
            "sunscreen": ["skincare", "skin care", "sunscreen", "sunblock", "spf", "uv protection", "sun cream"],
            "sunblock": ["skincare", "skin care", "sunscreen", "sunblock", "spf"],
            "spf": ["skincare", "skin care", "sunscreen", "sunblock", "spf", "uv"],
            "uv": ["skincare", "skin care", "sunscreen", "spf", "uv", "protection"],
            "anti aging": ["skincare", "skin care", "anti aging", "anti wrinkle", "youth", "firming"],
            "anti wrinkle": ["skincare", "skin care", "anti aging", "anti wrinkle", "youth"],
            "wrinkle": ["skincare", "skin care", "anti aging", "anti wrinkle", "wrinkle", "line"],
            "firming": ["skincare", "skin care", "anti aging", "firming", "tightening", "lift"],
            "acne": ["skincare", "skin care", "acne", "pimple", "breakout", "blemish", "oily skin"],
            "pimple": ["skincare", "skin care", "acne", "pimple", "breakout", "zit"],
            "breakout": ["skincare", "skin care", "acne", "pimple", "breakout"],
            "blemish": ["skincare", "skin care", "acne", "blemish", "spot", "mark"],
            "oily skin": ["skincare", "skin care", "oily skin", "oily", "acne", "pimple"],
            "dry skin": ["skincare", "skin care", "dry skin", "dry", "hydrating", "moisturizing"],
            "sensitive skin": ["skincare", "skin care", "sensitive skin", "sensitive", "gentle"],
            "dark circle": ["skincare", "skin care", "dark circle", "eye cream", "under eye", "eye bag"],
            "eye cream": ["skincare", "skin care", "dark circle", "eye cream", "under eye"],
            "under eye": ["skincare", "skin care", "dark circle", "eye cream", "under eye"],
            "eye bag": ["skincare", "skin care", "dark circle", "eye bag", "puffy eye"],
            "face mask": ["skincare", "skin care", "face mask", "mask", "sheet mask", "clay mask", "peel"],
            "mask": ["skincare", "skin care", "face mask", "mask", "sheet mask", "clay mask"],
            "sheet mask": ["skincare", "skin care", "face mask", "mask", "sheet mask"],
            "clay mask": ["skincare", "skin care", "face mask", "mask", "clay mask"],
            "scrub": ["skincare", "skin care", "scrub", "exfoliate", "exfoliator", "peel"],
            "exfoliate": ["skincare", "skin care", "scrub", "exfoliate", "exfoliator"],
            "exfoliator": ["skincare", "skin care", "scrub", "exfoliate", "exfoliator"],
            "peel": ["skincare", "skin care", "scrub", "peel", "exfoliate"],
            "hydrating": ["skincare", "skin care", "hydrating", "hydration", "moisturizing", "dry skin"],
            "hydration": ["skincare", "skin care", "hydrating", "hydration", "moisturizing"],
            "glowing": ["skincare", "skin care", "glowing", "glow", "radiant", "brightening"],
            "brightening": ["skincare", "skin care", "glowing", "brightening", "whitening", "fairness"],
            "whitening": ["skincare", "skin care", "brightening", "whitening", "fairness"],
            "fairness": ["skincare", "skin care", "brightening", "whitening", "fairness"],
            "complexion": ["skincare", "skin care", "complexion", "skin tone", "texture"],
            
            // Hair Care
            "hair": ["hair", "haircare", "hair care", "shampoo", "conditioner", "oil", "serum", "mask", "color", "dye", "styling", "straightener", "curler", "dryer", "comb", "brush"],
            "haircare": ["hair", "haircare", "hair care", "shampoo", "conditioner", "oil"],
            "hair care": ["hair", "haircare", "hair care", "shampoo", "conditioner", "oil"],
            "shampoo": ["hair", "haircare", "shampoo", "hair wash", "cleansing", "anti dandruff"],
            "hair wash": ["hair", "haircare", "shampoo", "hair wash", "cleansing"],
            "conditioner": ["hair", "haircare", "conditioner", "hair conditioner", "softening", "smoothing"],
            "hair conditioner": ["hair", "haircare", "conditioner", "hair conditioner"],
            "oil": ["hair", "haircare", "oil", "hair oil", "coconut oil", "argan oil", "serum"],
            "hair oil": ["hair", "haircare", "oil", "hair oil", "coconut oil", "argan oil"],
            "coconut oil": ["hair", "haircare", "oil", "hair oil", "coconut oil"],
            "argan oil": ["hair", "haircare", "oil", "hair oil", "argan oil"],
            "serum": ["hair", "haircare", "serum", "hair serum", "oil"],
            "hair serum": ["hair", "haircare", "serum", "hair serum"],
            "hair mask": ["hair", "haircare", "hair mask", "deep conditioning", "treatment"],
            "deep conditioning": ["hair", "haircare", "hair mask", "deep conditioning", "treatment"],
            "hair color": ["hair", "haircare", "hair color", "hair dye", "coloring", "henna"],
            "hair dye": ["hair", "haircare", "hair color", "hair dye", "coloring"],
            "coloring": ["hair", "haircare", "hair color", "hair dye", "coloring"],
            "henna": ["hair", "haircare", "henna", "mehndi", "natural dye"],
            "mehndi": ["hair", "haircare", "henna", "mehndi"],
            "dandruff": ["hair", "haircare", "dandruff", "anti dandruff", "itchy scalp", "flaky"],
            "anti dandruff": ["hair", "haircare", "dandruff", "anti dandruff", "shampoo"],
            "itchy scalp": ["hair", "haircare", "dandruff", "itchy scalp"],
            "hair fall": ["hair", "haircare", "hair fall", "hair loss", "thinning", "baldness"],
            "hair loss": ["hair", "haircare", "hair fall", "hair loss", "thinning"],
            "thinning": ["hair", "haircare", "hair fall", "thinning", "volume"],
            "volume": ["hair", "haircare", "volume", "volumizing", "thickening"],
            "volumizing": ["hair", "haircare", "volume", "volumizing", "thickening"],
            "thickening": ["hair", "haircare", "volume", "thickening"],
            "frizz": ["hair", "haircare", "frizz", "frizzy", "smoothing", "straightening"],
            "frizzy": ["hair", "haircare", "frizz", "frizzy", "smoothing"],
            "smoothing": ["hair", "haircare", "smoothing", "smooth", "straightening", "frizz"],
            "straightening": ["hair", "haircare", "straightening", "straight", "smoothing"],
            "straightener": ["hair", "haircare", "straightener", "flat iron", "hair iron"],
            "flat iron": ["hair", "haircare", "straightener", "flat iron"],
            "curler": ["hair", "haircare", "curler", "curling iron", "curls", "waves"],
            "curling iron": ["hair", "haircare", "curler", "curling iron"],
            "curls": ["hair", "haircare", "curler", "curls", "waves", "curling"],
            "waves": ["hair", "haircare", "curler", "curls", "waves"],
            "dryer": ["hair", "haircare", "dryer", "hair dryer", "blow dryer"],
            "hair dryer": ["hair", "haircare", "dryer", "hair dryer", "blow dryer"],
            "blow dryer": ["hair", "haircare", "dryer", "hair dryer", "blow dryer"],
            "comb": ["hair", "haircare", "comb", "hair comb", "detangle"],
            "hair comb": ["hair", "haircare", "comb", "hair comb"],
            "detangle": ["hair", "haircare", "comb", "detangle", "detangler"],
            "hair brush": ["hair", "haircare", "brush", "hair brush", "comb"],
            "styling": ["hair", "haircare", "styling", "style", "gel", "mousse", "spray", "wax", "pomade"],
            "gel": ["hair", "haircare", "styling", "gel", "hair gel"],
            "hair gel": ["hair", "haircare", "styling", "gel", "hair gel"],
            "mousse": ["hair", "haircare", "styling", "mousse", "foam"],
            "spray": ["hair", "haircare", "styling", "spray", "hair spray"],
            "hair spray": ["hair", "haircare", "styling", "spray", "hair spray"],
            "wax": ["hair", "haircare", "styling", "wax", "hair wax", "pomade"],
            "hair wax": ["hair", "haircare", "styling", "wax", "hair wax"],
            "pomade": ["hair", "haircare", "styling", "wax", "pomade"],
            
            // Health
            "health": ["health", "healthy", "wellness", "wellbeing", "fitness", "medicine", "supplement", "vitamin", "protein", "nutrition", "diet", "immunity", "first aid", "personal care"],
            "healthy": ["health", "healthy", "wellness", "wellbeing", "fitness"],
            "wellness": ["health", "wellness", "wellbeing", "healthy", "self care"],
            "wellbeing": ["health", "wellness", "wellbeing", "healthy"],
            "medicine": ["health", "medicine", "medication", "pill", "tablet", "capsule", "syrup", "ointment", "pain relief"],
            "medication": ["health", "medicine", "medication", "pill", "tablet"],
            "pill": ["health", "medicine", "pill", "pills", "tablet", "capsule"],
            "pills": ["health", "medicine", "pill", "pills", "tablet"],
            "tablet": ["health", "medicine", "pill", "tablet", "capsule"],
            "capsule": ["health", "medicine", "pill", "tablet", "capsule"],
            "syrup": ["health", "medicine", "syrup", "cough syrup", "tonic"],
            "ointment": ["health", "medicine", "ointment", "cream", "balm", "rub"],
            "balm": ["health", "medicine", "balm", "ointment", "rub", "vicks"],
            "vicks": ["health", "medicine", "balm", "vicks", "cold"],
            "pain relief": ["health", "medicine", "pain relief", "painkiller", "analgesic", "relief"],
            "painkiller": ["health", "medicine", "pain relief", "painkiller", "analgesic"],
            "analgesic": ["health", "medicine", "pain relief", "painkiller", "analgesic"],
            "relief": ["health", "medicine", "pain relief", "relief", "comfort"],
            "supplement": ["health", "supplement", "supplements", "vitamin", "protein", "nutrition", "dietary"],
            "supplements": ["health", "supplement", "supplements", "vitamin", "protein"],
            "vitamin": ["health", "supplement", "vitamin", "vitamins", "multivitamin", "nutrition"],
            "vitamins": ["health", "supplement", "vitamin", "vitamins", "multivitamin"],
            "multivitamin": ["health", "supplement", "vitamin", "multivitamin"],
            "protein": ["health", "supplement", "protein", "whey", "mass gainer", "bcaa", "creatine"],
            "whey": ["health", "supplement", "protein", "whey", "mass gainer"],
            "mass gainer": ["health", "supplement", "protein", "mass gainer", "weight gainer"],
            "weight gainer": ["health", "supplement", "mass gainer", "weight gainer"],
            "bcaa": ["health", "supplement", "protein", "bcaa", "amino acid"],
            "creatine": ["health", "supplement", "protein", "creatine"],
            "amino acid": ["health", "supplement", "bcaa", "amino acid"],
            "nutrition": ["health", "nutrition", "nutritional", "diet", "healthy eating"],
            "nutritional": ["health", "nutrition", "nutritional", "diet"],
            "diet": ["health", "nutrition", "diet", "dieting", "weight loss", "keto", "vegan"],
            "dieting": ["health", "nutrition", "diet", "dieting", "weight loss"],
            "weight loss": ["health", "nutrition", "diet", "weight loss", "slimming", "fat burn"],
            "slimming": ["health", "nutrition", "diet", "slimming", "weight loss"],
            "fat burn": ["health", "nutrition", "diet", "fat burn", "fat burner"],
            "fat burner": ["health", "nutrition", "diet", "fat burn", "fat burner"],
            "keto": ["health", "nutrition", "diet", "keto", "ketogenic"],
            "vegan": ["health", "nutrition", "diet", "vegan", "plant based"],
            "plant based": ["health", "nutrition", "diet", "vegan", "plant based"],
            "immunity": ["health", "immunity", "immune", "booster", "vitamin c", "zinc"],
            "immune": ["health", "immunity", "immune", "booster"],
            "booster": ["health", "immunity", "booster", "energy", "stamina"],
            "energy": ["health", "energy", "stamina", "booster", "power"],
            "stamina": ["health", "energy", "stamina", "endurance"],
            "endurance": ["health", "stamina", "endurance"],
            "first aid": ["health", "first aid", "bandage", "antiseptic", "cotton", "gauge", "medical kit"],
            "bandage": ["health", "first aid", "bandage", "plaster", "wound"],
            "antiseptic": ["health", "first aid", "antiseptic", "detol", "savlon"],
            "detol": ["health", "first aid", "antiseptic", "detol"],
            "savlon": ["health", "first aid", "antiseptic", "savlon"],
            "cotton": ["health", "first aid", "cotton", "cotton ball", "swab"],
            "gauge": ["health", "first aid", "gauge", "bandage"],
            "medical kit": ["health", "first aid", "medical kit", "first aid box"],
            "first aid box": ["health", "first aid", "medical kit", "first aid box"],
            "personal care": ["health", "personal care", "hygiene", "sanitary", "deodorant", "perfume", "toothpaste", "soap", "sanitizer"],
            "hygiene": ["health", "personal care", "hygiene", "sanitary", "clean"],
            "sanitary": ["health", "personal care", "sanitary", "pad", "napkin", "tampon", "menstrual"],
            "pad": ["health", "personal care", "sanitary", "pad", "napkin"],
            "napkin": ["health", "personal care", "sanitary", "pad", "napkin"],
            "tampon": ["health", "personal care", "sanitary", "tampon", "menstrual"],
            "menstrual": ["health", "personal care", "sanitary", "menstrual", "period"],
            "period": ["health", "personal care", "sanitary", "menstrual", "period"],
            "deodorant": ["health", "personal care", "deodorant", "deo", "roll on", "antiperspirant"],
            "deo": ["health", "personal care", "deodorant", "deo"],
            "roll on": ["health", "personal care", "deodorant", "roll on"],
            "antiperspirant": ["health", "personal care", "deodorant", "antiperspirant"],
            "perfume": ["health", "personal care", "perfume", "fragrance", "scent", "cologne", "attar"],
            "fragrance": ["health", "personal care", "perfume", "fragrance", "scent"],
            "scent": ["health", "personal care", "perfume", "fragrance", "scent"],
            "cologne": ["health", "personal care", "perfume", "cologne"],
            "attar": ["health", "personal care", "perfume", "attar", "ittar"],
            "toothpaste": ["health", "personal care", "toothpaste", "tooth brush", "tooth powder", "oral care"],
            "tooth brush": ["health", "personal care", "toothpaste", "tooth brush", "oral care"],
            "tooth powder": ["health", "personal care", "toothpaste", "tooth powder"],
            "oral care": ["health", "personal care", "toothpaste", "oral care", "mouthwash"],
            "mouthwash": ["health", "personal care", "oral care", "mouthwash"],
            "soap": ["health", "personal care", "soap", "body wash", "shower gel", "bathing"],
            "body wash": ["health", "personal care", "soap", "body wash", "shower gel"],
            "shower gel": ["health", "personal care", "soap", "body wash", "shower gel"],
            "bathing": ["health", "personal care", "soap", "bathing", "shower"],
            "shower": ["health", "personal care", "soap", "bathing", "shower"],
            "sanitizer": ["health", "personal care", "sanitizer", "hand sanitizer", "disinfectant"],
            "hand sanitizer": ["health", "personal care", "sanitizer", "hand sanitizer"],
            "disinfectant": ["health", "personal care", "sanitizer", "disinfectant"],
            "shampoo": ["hair", "haircare", "shampoo"], // duplicate handled
            
            // ========== 5. SPORTS AND OUTDOOR ==========
            "sport": ["sport", "sports", "fitness", "exercise", "workout", "athletic", "game", "playing", "outdoor", "indoor"],
            "sports": ["sport", "sports", "fitness", "exercise", "workout", "athletic", "game"],
            "athletic": ["sport", "sports", "athletic", "athlete", "fitness", "performance"],
            "athlete": ["sport", "sports", "athletic", "athlete", "fitness"],
            "game": ["sport", "sports", "game", "games", "playing", "toy", "board game"],
            "games": ["sport", "sports", "game", "games", "playing"],
            "playing": ["sport", "sports", "game", "playing", "toy", "fun"],
            
            // Gym Equipment
            "gym": ["gym", "fitness", "exercise", "workout", "training", "weight", "dumbbell", "barbell", "treadmill", "equipment", "machine", "yoga", "mat", "ball", "rope", "band", "bench", "rack"],
            "fitness": ["gym", "fitness", "exercise", "workout", "training", "health", "active"],
            "exercise": ["gym", "fitness", "exercise", "workout", "training", "cardio", "aerobic"],
            "workout": ["gym", "fitness", "exercise", "workout", "training", "session"],
            "training": ["gym", "fitness", "exercise", "workout", "training", "strength", "endurance"],
            "cardio": ["gym", "fitness", "exercise", "cardio", "aerobic", "running", "cycling"],
            "aerobic": ["gym", "fitness", "exercise", "cardio", "aerobic"],
            "strength": ["gym", "fitness", "training", "strength", "power", "muscle"],
            "muscle": ["gym", "fitness", "training", "muscle", "bodybuilding", "gain"],
            "bodybuilding": ["gym", "fitness", "training", "muscle", "bodybuilding", "gain"],
            "gain": ["gym", "fitness", "training", "muscle", "gain", "bulk"],
            "bulk": ["gym", "fitness", "training", "muscle", "bulk"],
            "weight": ["gym", "fitness", "weight", "dumbbell", "barbell", "plate", "kettlebell"],
            "dumbbell": ["gym", "fitness", "weight", "dumbbell", "dumbbells", "free weight"],
            "dumbbells": ["gym", "fitness", "weight", "dumbbell", "dumbbells"],
            "dumble": ["gym", "fitness", "weight", "dumbbell", "dumbbells", "free weight"], // common misspelling
            "barbell": ["gym", "fitness", "weight", "barbell", "olympic", "bench press"],
            "plate": ["gym", "fitness", "weight", "plate", "weight plate"],
            "weight plate": ["gym", "fitness", "weight", "plate", "weight plate"],
            "kettlebell": ["gym", "fitness", "weight", "kettlebell", "kettlebells"],
            "kettlebells": ["gym", "fitness", "weight", "kettlebell", "kettlebells"],
            "free weight": ["gym", "fitness", "weight", "dumbbell", "barbell", "free weight"],
            "treadmill": ["gym", "fitness", "treadmill", "running machine", "cardio machine"],
            "running machine": ["gym", "fitness", "treadmill", "running machine"],
            "elliptical": ["gym", "fitness", "elliptical", "cross trainer", "cardio machine"],
            "cross trainer": ["gym", "fitness", "elliptical", "cross trainer"],
            "stationary bike": ["gym", "fitness", "stationary bike", "exercise bike", "spin bike", "cycling"],
            "exercise bike": ["gym", "fitness", "stationary bike", "exercise bike", "spin bike"],
            "spin bike": ["gym", "fitness", "stationary bike", "exercise bike", "spin bike"],
            "rowing machine": ["gym", "fitness", "rowing machine", "rower"],
            "rower": ["gym", "fitness", "rowing machine", "rower"],
            "cardio machine": ["gym", "fitness", "treadmill", "elliptical", "cardio machine"],
            "equipment": ["gym", "fitness", "equipment", "gear", "machine", "apparatus"],
            "machine": ["gym", "fitness", "equipment", "machine", "apparatus"],
            "gear": ["gym", "fitness", "equipment", "gear", "accessory"],
            "bench": ["gym", "fitness", "bench", "bench press", "workout bench"],
            "bench press": ["gym", "fitness", "bench", "bench press", "chest"],
            "workout bench": ["gym", "fitness", "bench", "workout bench"],
            "rack": ["gym", "fitness", "rack", "squat rack", "power rack"],
            "squat rack": ["gym", "fitness", "rack", "squat rack", "power rack"],
            "power rack": ["gym", "fitness", "rack", "squat rack", "power rack"],
            "yoga": ["gym", "fitness", "yoga", "pilates", "stretching", "flexibility", "meditation"],
            "pilates": ["gym", "fitness", "yoga", "pilates", "stretching"],
            "stretching": ["gym", "fitness", "yoga", "stretching", "flexibility", "warm up"],
            "flexibility": ["gym", "fitness", "yoga", "stretching", "flexibility"],
            "meditation": ["gym", "fitness", "yoga", "meditation", "mindfulness", "relaxation"],
            "mindfulness": ["gym", "fitness", "yoga", "meditation", "mindfulness"],
            "mat": ["gym", "fitness", "yoga", "mat", "yoga mat", "exercise mat"],
            "yoga mat": ["gym", "fitness", "yoga", "mat", "yoga mat"],
            "exercise mat": ["gym", "fitness", "mat", "exercise mat"],
            "ball": ["gym", "fitness", "ball", "gym ball", "exercise ball", "medicine ball", "stability ball"],
            "gym ball": ["gym", "fitness", "ball", "gym ball", "exercise ball"],
            "exercise ball": ["gym", "fitness", "ball", "gym ball", "exercise ball"],
            "medicine ball": ["gym", "fitness", "ball", "medicine ball"],
            "stability ball": ["gym", "fitness", "ball", "stability ball"],
            "rope": ["gym", "fitness", "rope", "jump rope", "skipping rope", "battle rope"],
            "jump rope": ["gym", "fitness", "rope", "jump rope", "skipping rope"],
            "skipping rope": ["gym", "fitness", "rope", "jump rope", "skipping rope"],
            "battle rope": ["gym", "fitness", "rope", "battle rope"],
            "band": ["gym", "fitness", "band", "resistance band", "exercise band", "loop band"],
            "resistance band": ["gym", "fitness", "band", "resistance band", "exercise band"],
            "exercise band": ["gym", "fitness", "band", "resistance band", "exercise band"],
            "loop band": ["gym", "fitness", "band", "loop band"],
            "foam roller": ["gym", "fitness", "foam roller", "recovery", "massage"],
            "recovery": ["gym", "fitness", "foam roller", "recovery", "rest"],
            "massage": ["gym", "fitness", "foam roller", "massage", "relax"],
            "active": ["gym", "fitness", "active", "activity", "lifestyle"],
            "activity": ["gym", "fitness", "active", "activity", "lifestyle"],
            
            // Sports
            "cricket": ["sport", "sports", "cricket", "bat", "ball", "wicket", "pad", "helmet", "gloves"],
            "bat": ["sport", "sports", "cricket", "bat", "baseball bat", "tennis"],
            "wicket": ["sport", "sports", "cricket", "wicket", "stumps"],
            "stumps": ["sport", "sports", "cricket", "wicket", "stumps"],
            "pad": ["sport", "sports", "cricket", "pad", "guards"],
            "guards": ["sport", "sports", "cricket", "pad", "guards", "protection"],
            "helmet": ["sport", "sports", "cricket", "helmet", "protection", "safety"],
            "gloves": ["sport", "sports", "cricket", "gloves", "batting gloves", "keeping gloves"],
            "batting gloves": ["sport", "sports", "cricket", "gloves", "batting gloves"],
            "keeping gloves": ["sport", "sports", "cricket", "gloves", "keeping gloves"],
            "football": ["sport", "sports", "football", "soccer", "ball", "goal", "cleats", "boots"],
            "soccer": ["sport", "sports", "football", "soccer", "ball", "goal"],
            "goal": ["sport", "sports", "football", "goal", "net"],
            "cleats": ["sport", "sports", "football", "cleats", "boots", "shoes"],
            "basketball": ["sport", "sports", "basketball", "hoop", "ball", "court"],
            "hoop": ["sport", "sports", "basketball", "hoop", "ring"],
            "tennis": ["sport", "sports", "tennis", "racket", "racquet", "ball", "court"],
            "racket": ["sport", "sports", "tennis", "racket", "racquet", "badminton"],
            "racquet": ["sport", "sports", "tennis", "racket", "racquet", "badminton"],
            "badminton": ["sport", "sports", "badminton", "racket", "racquet", "shuttlecock"],
            "shuttlecock": ["sport", "sports", "badminton", "shuttlecock", "shuttle"],
            "shuttle": ["sport", "sports", "badminton", "shuttlecock", "shuttle"],
            "volleyball": ["sport", "sports", "volleyball", "net", "ball"],
            "baseball": ["sport", "sports", "baseball", "bat", "ball", "glove"],
            "baseball bat": ["sport", "sports", "baseball", "bat", "baseball bat"],
            "hockey": ["sport", "sports", "hockey", "stick", "ball", "field hockey", "ice hockey"],
            "stick": ["sport", "sports", "hockey", "stick", "bat"],
            "field hockey": ["sport", "sports", "hockey", "field hockey"],
            "ice hockey": ["sport", "sports", "hockey", "ice hockey", "skates"],
            "skates": ["sport", "sports", "ice hockey", "skates", "skating", "roller"],
            "skating": ["sport", "sports", "skates", "skating", "roller", "inline"],
            "roller": ["sport", "sports", "skates", "skating", "roller", "inline"],
            "inline": ["sport", "sports", "skates", "skating", "inline"],
            "swimming": ["sport", "sports", "swimming", "swim", "pool", "goggles", "cap", "costume"],
            "swim": ["sport", "sports", "swimming", "swim", "pool"],
            "pool": ["sport", "sports", "swimming", "pool", "water"],
            "goggles": ["sport", "sports", "swimming", "goggles", "eye protection"],
            "swimming cap": ["sport", "sports", "swimming", "cap", "swimming cap"],
            "costume": ["sport", "sports", "swimming", "costume", "swimsuit", "bikini", "trunks"],
            "swimsuit": ["sport", "sports", "swimming", "swimsuit", "costume"],
            "bikini": ["sport", "sports", "swimming", "bikini", "swimsuit"],
            "trunks": ["sport", "sports", "swimming", "trunks", "shorts"],
            "cycling": ["sport", "sports", "cycling", "cycle", "bicycle", "bike", "mountain bike", "road bike"],
            "cycle": ["sport", "sports", "cycling", "cycle", "bicycle", "bike"],
            "bicycle": ["sport", "sports", "cycling", "bicycle", "bike", "cycle"],
            "bike": ["sport", "sports", "cycling", "bike", "bicycle", "motorcycle"],
            "mountain bike": ["sport", "sports", "cycling", "mountain bike", "mtb"],
            "mtb": ["sport", "sports", "cycling", "mountain bike", "mtb"],
            "road bike": ["sport", "sports", "cycling", "road bike"],
            "running": ["sport", "sports", "running", "jogging", "marathon", "sprint", "track"],
            "jogging": ["sport", "sports", "running", "jogging", "marathon"],
            "marathon": ["sport", "sports", "running", "marathon", "long distance"],
            "sprint": ["sport", "sports", "running", "sprint", "track"],
            "track": ["sport", "sports", "running", "track", "field"],
            "field": ["sport", "sports", "track", "field", "athletics"],
            "athletics": ["sport", "sports", "athletics", "track", "field"],
            "golf": ["sport", "sports", "golf", "club", "ball", "course"],
            "club": ["sport", "sports", "golf", "club", "stick"],
            "course": ["sport", "sports", "golf", "course"],
            "boxing": ["sport", "sports", "boxing", "gloves", "punch", "mma", "martial art"],
            "punch": ["sport", "sports", "boxing", "punch", "mma", "martial art"],
            "mma": ["sport", "sports", "boxing", "mma", "mixed martial art", "ufc"],
            "mixed martial art": ["sport", "sports", "boxing", "mma", "mixed martial art"],
            "ufc": ["sport", "sports", "mma", "ufc", "fighting"],
            "martial art": ["sport", "sports", "boxing", "mma", "martial art", "karate", "taekwondo", "judo"],
            "karate": ["sport", "sports", "martial art", "karate", "judo", "taekwondo"],
            "taekwondo": ["sport", "sports", "martial art", "karate", "taekwondo"],
            "judo": ["sport", "sports", "martial art", "karate", "judo"],
            "fencing": ["sport", "sports", "fencing", "sword"],
            "sword": ["sport", "sports", "fencing", "sword"],
            "archery": ["sport", "sports", "archery", "bow", "arrow"],
            "bow": ["sport", "sports", "archery", "bow", "arrow"],
            "arrow": ["sport", "sports", "archery", "bow", "arrow"],
            
            // Outdoor
            "outdoor": ["outdoor", "camping", "hiking", "trekking", "adventure", "nature", "travel", "tent", "backpack", "sleeping bag"],
            "camping": ["outdoor", "camping", "tent", "camp", "outdoor", "adventure"],
            "camp": ["outdoor", "camping", "camp", "tent", "outdoor"],
            "tent": ["outdoor", "camping", "tent", "camp", "shelter"],
            "shelter": ["outdoor", "camping", "tent", "shelter"],
            "hiking": ["outdoor", "hiking", "trekking", "trail", "mountain", "boots", "backpack"],
            "trekking": ["outdoor", "hiking", "trekking", "trail", "mountain"],
            "trail": ["outdoor", "hiking", "trekking", "trail", "path"],
            "mountain": ["outdoor", "hiking", "trekking", "mountain", "hill"],
            "hill": ["outdoor", "hiking", "trekking", "mountain", "hill"],
            "adventure": ["outdoor", "adventure", "expedition", "explore", "thrill"],
            "expedition": ["outdoor", "adventure", "expedition", "explore"],
            "explore": ["outdoor", "adventure", "explore", "discovery"],
            "nature": ["outdoor", "nature", "wildlife", "forest", "jungle"],
            "wildlife": ["outdoor", "nature", "wildlife", "animal", "safari"],
            "forest": ["outdoor", "nature", "forest", "jungle", "woods"],
            "jungle": ["outdoor", "nature", "forest", "jungle", "safari"],
            "woods": ["outdoor", "nature", "forest", "woods"],
            "safari": ["outdoor", "nature", "wildlife", "safari", "trip"],
            "travel": ["outdoor", "travel", "trip", "journey", "tour", "vacation", "luggage"],
            "trip": ["outdoor", "travel", "trip", "journey", "tour"],
            "journey": ["outdoor", "travel", "trip", "journey", "tour"],
            "tour": ["outdoor", "travel", "trip", "tour", "sightseeing"],
            "vacation": ["outdoor", "travel", "vacation", "holiday", "resort"],
            "holiday": ["outdoor", "travel", "vacation", "holiday", "resort"],
            "resort": ["outdoor", "travel", "vacation", "resort", "hotel"],
            "luggage": ["outdoor", "travel", "luggage", "suitcase", "bag", "backpack", "duffle"],
            "suitcase": ["outdoor", "travel", "luggage", "suitcase", "bag"],
            "duffle": ["outdoor", "travel", "luggage", "duffle", "bag"],
            "sleeping bag": ["outdoor", "camping", "sleeping bag", "sleep"],
            "compass": ["outdoor", "camping", "compass", "navigation", "direction"],
            "navigation": ["outdoor", "camping", "compass", "navigation", "gps"],
            "binocular": ["outdoor", "binocular", "binoculars", "scope", "view"],
            "binoculars": ["outdoor", "binocular", "binoculars"],
            "fishing": ["outdoor", "fishing", "rod", "reel", "bait", "angler"],
            "rod": ["outdoor", "fishing", "rod", "pole"],
            "reel": ["outdoor", "fishing", "reel"],
            "bait": ["outdoor", "fishing", "bait"],
            "angler": ["outdoor", "fishing", "angler"],
            
            // ========== 6. BOOKS AND STATIONERY ==========
            "book": ["book", "books", "novel", "fiction", "non fiction", "story", "reading", "literature", "author", "publisher", "textbook", "educational", "comic", "magazine", "journal"],
            "books": ["book", "books", "novel", "fiction", "non fiction", "story", "reading", "literature"],
            "novel": ["book", "books", "novel", "fiction", "story", "bestseller"],
            "fiction": ["book", "books", "novel", "fiction", "story", "imaginary"],
            "non fiction": ["book", "books", "non fiction", "biography", "autobiography", "history"],
            "story": ["book", "books", "novel", "fiction", "story", "tale", "fable"],
            "tale": ["book", "books", "story", "tale", "fable"],
            "fable": ["book", "books", "story", "tale", "fable"],
            "reading": ["book", "books", "reading", "reader", "literature"],
            "reader": ["book", "books", "reading", "reader"],
            "literature": ["book", "books", "reading", "literature", "classic", "poetry"],
            "classic": ["book", "books", "literature", "classic", "masterpiece"],
            "masterpiece": ["book", "books", "classic", "masterpiece"],
            "poetry": ["book", "books", "literature", "poetry", "poem", "verse"],
            "poem": ["book", "books", "poetry", "poem", "verse"],
            "verse": ["book", "books", "poetry", "poem", "verse"],
            "author": ["book", "books", "author", "writer", "novelist"],
            "writer": ["book", "books", "author", "writer", "novelist"],
            "novelist": ["book", "books", "author", "writer", "novelist"],
            "publisher": ["book", "books", "publisher", "publishing", "press"],
            "publishing": ["book", "books", "publisher", "publishing"],
            "press": ["book", "books", "publisher", "press"],
            "textbook": ["book", "books", "textbook", "school book", "academic", "study"],
            "school book": ["book", "books", "textbook", "school book", "academic"],
            "academic": ["book", "books", "textbook", "academic", "study", "education"],
            "study": ["book", "books", "textbook", "study", "education", "learning"],
            "education": ["book", "books", "study", "education", "learning", "school"],
            "learning": ["book", "books", "study", "education", "learning"],
            "school": ["book", "books", "education", "school", "college", "university"],
            "college": ["book", "books", "education", "college", "university"],
            "university": ["book", "books", "education", "college", "university"],
            "comic": ["book", "books", "comic", "comics", "graphic novel", "manga", "superhero"],
            "comics": ["book", "books", "comic", "comics", "graphic novel"],
            "graphic novel": ["book", "books", "comic", "graphic novel"],
            "manga": ["book", "books", "comic", "manga", "anime"],
            "anime": ["book", "books", "comic", "manga", "anime"],
            "superhero": ["book", "books", "comic", "superhero", "marvel", "dc"],
            "marvel": ["book", "books", "comic", "superhero", "marvel"],
            "dc": ["book", "books", "comic", "superhero", "dc"],
            "magazine": ["book", "books", "magazine", "periodical", "journal", "publication"],
            "periodical": ["book", "books", "magazine", "periodical"],
            "journal": ["book", "books", "magazine", "journal", "diary"],
            "diary": ["book", "books", "journal", "diary", "planner", "notebook"],
            "publication": ["book", "books", "magazine", "publication"],
            "bestseller": ["book", "books", "novel", "bestseller", "popular", "hit"],
            "popular": ["book", "books", "bestseller", "popular", "hit"],
            "hit": ["book", "books", "bestseller", "popular", "hit"],
            "ebook": ["book", "books", "ebook", "kindle", "digital book", "pdf"],
            "kindle": ["book", "books", "ebook", "kindle", "digital book"],
            "digital book": ["book", "books", "ebook", "kindle", "digital book"],
            "pdf": ["book", "books", "ebook", "pdf"],
            "audiobook": ["book", "books", "audiobook", "audio book", "listening"],
            "audio book": ["book", "books", "audiobook", "audio book"],
            
            // Stationery
            "stationery": ["stationery", "stationary", "pen", "pencil", "eraser", "sharpener", "ruler", "marker", "highlighter", "stapler", "paper", "notebook", "notepad", "diary", "folder", "file", "glue", "tape", "scissors", "calculator", "ink"],
            "stationary": ["stationery", "stationary", "pen", "pencil", "eraser", "paper"], // common misspelling
            "pen": ["stationery", "pen", "pens", "ballpoint", "gel pen", "fountain pen", "ink pen"],
            "pens": ["stationery", "pen", "pens", "ballpoint"],
            "ballpoint": ["stationery", "pen", "ballpoint", "ball pen"],
            "ball pen": ["stationery", "pen", "ballpoint", "ball pen"],
            "gel pen": ["stationery", "pen", "gel pen"],
            "fountain pen": ["stationery", "pen", "fountain pen"],
            "ink pen": ["stationery", "pen", "ink pen", "fountain pen"],
            "pencil": ["stationery", "pencil", "pencils", "lead pencil", "mechanical pencil"],
            "pencils": ["stationery", "pencil", "pencils"],
            "lead pencil": ["stationery", "pencil", "lead pencil"],
            "mechanical pencil": ["stationery", "pencil", "mechanical pencil"],
            "eraser": ["stationery", "eraser", "rubber", "corrector"],
            "rubber": ["stationery", "eraser", "rubber"],
            "corrector": ["stationery", "eraser", "corrector", "white out"],
            "white out": ["stationery", "corrector", "white out"],
            "sharpener": ["stationery", "sharpener", "pencil sharpener"],
            "pencil sharpener": ["stationery", "sharpener", "pencil sharpener"],
            "ruler": ["stationery", "ruler", "scale", "measuring"],
            "scale": ["stationery", "ruler", "scale"],
            "measuring": ["stationery", "ruler", "measuring", "tape"],
            "marker": ["stationery", "marker", "markers", "permanent marker", "whiteboard marker"],
            "markers": ["stationery", "marker", "markers"],
            "permanent marker": ["stationery", "marker", "permanent marker"],
            "whiteboard marker": ["stationery", "marker", "whiteboard marker"],
            "highlighter": ["stationery", "highlighter", "highlight", "marker"],
            "highlight": ["stationery", "highlighter", "highlight"],
            "stapler": ["stationery", "stapler", "staple", "pin"],
            "staple": ["stationery", "stapler", "staple"],
            "pin": ["stationery", "stapler", "pin", "paper pin", "push pin"],
            "paper pin": ["stationery", "pin", "paper pin"],
            "push pin": ["stationery", "pin", "push pin"],
            "paper": ["stationery", "paper", "sheet", "a4", "letter", "printing", "copy"],
            "sheet": ["stationery", "paper", "sheet"],
            "a4": ["stationery", "paper", "a4", "a3", "letter"],
            "a3": ["stationery", "paper", "a4", "a3"],
            "letter": ["stationery", "paper", "letter", "envelope"],
            "printing": ["stationery", "paper", "printing", "printer"],
            "copy": ["stationery", "paper", "copy", "xerox", "duplicate"],
            "xerox": ["stationery", "paper", "copy", "xerox"],
            "duplicate": ["stationery", "paper", "copy", "duplicate"],
            "notebook": ["stationery", "notebook", "notebooks", "exercise book", "copy", "writing pad"],
            "notebooks": ["stationery", "notebook", "notebooks"],
            "exercise book": ["stationery", "notebook", "exercise book"],
            "writing pad": ["stationery", "notebook", "writing pad", "notepad"],
            "notepad": ["stationery", "notebook", "notepad", "memo", "sticky note"],
            "memo": ["stationery", "notepad", "memo"],
            "sticky note": ["stationery", "notepad", "sticky note", "post it"],
            "post it": ["stationery", "notepad", "sticky note", "post it"],
            "folder": ["stationery", "folder", "file", "binder", "organizer"],
            "file": ["stationery", "folder", "file", "binder"],
            "binder": ["stationery", "folder", "file", "binder"],
            "organizer": ["stationery", "folder", "organizer", "planner"],
            "planner": ["stationery", "organizer", "planner", "diary", "schedule"],
            "schedule": ["stationery", "planner", "schedule", "calendar"],
            "calendar": ["stationery", "planner", "calendar", "date"],
            "glue": ["stationery", "glue", "adhesive", "fevicol", "stick"],
            "adhesive": ["stationery", "glue", "adhesive", "tape"],
            "fevicol": ["stationery", "glue", "fevicol"],
            "stick": ["stationery", "glue", "stick", "glue stick"],
            "glue stick": ["stationery", "glue", "glue stick"],
            "tape": ["stationery", "tape", "cello tape", "duct tape", "masking tape", "adhesive"],
            "cello tape": ["stationery", "tape", "cello tape", "transparent tape"],
            "transparent tape": ["stationery", "tape", "cello tape", "transparent tape"],
            "duct tape": ["stationery", "tape", "duct tape"],
            "masking tape": ["stationery", "tape", "masking tape"],
            "scissors": ["stationery", "scissors", "cutter", "blade", "trimmer"],
            "cutter": ["stationery", "scissors", "cutter", "blade", "paper cutter"],
            "blade": ["stationery", "scissors", "cutter", "blade"],
            "paper cutter": ["stationery", "scissors", "cutter", "paper cutter"],
            "trimmer": ["stationery", "scissors", "trimmer"],
            "calculator": ["stationery", "calculator", "calc", "counting", "math"],
            "calc": ["stationery", "calculator", "calc"],
            "counting": ["stationery", "calculator", "counting", "math"],
            "math": ["stationery", "calculator", "math", "mathematics", "geometry"],
            "mathematics": ["stationery", "math", "mathematics", "geometry"],
            "geometry": ["stationery", "math", "geometry", "compass", "protractor", "set square"],
            "compass": ["stationery", "geometry", "compass", "protractor"],
            "protractor": ["stationery", "geometry", "protractor", "set square"],
            "set square": ["stationery", "geometry", "set square"],
            "ink": ["stationery", "ink", "cartridge", "refill", "toner"],
            "cartridge": ["stationery", "ink", "cartridge", "refill"],
            "refill": ["stationery", "ink", "refill", "cartridge"],
            "toner": ["stationery", "ink", "toner", "printer"],
            "envelope": ["stationery", "envelope", "letter", "mail", "cover"],
            "mail": ["stationery", "envelope", "mail", "post"],
            "cover": ["stationery", "envelope", "cover", "file cover"],
            
            // Art Supplies
            "art": ["art", "art supply", "art supplies", "craft", "drawing", "painting", "sketch", "color", "canvas", "brush", "palette", "easel"],
            "art supply": ["art", "art supply", "art supplies", "craft", "drawing", "painting"],
            "art supplies": ["art", "art supply", "art supplies", "craft", "drawing", "painting"],
            "craft": ["art", "craft", "crafts", "diy", "handmade", "hobby"],
            "crafts": ["art", "craft", "crafts", "diy"],
            "diy": ["art", "craft", "diy", "do it yourself", "handmade"],
            "do it yourself": ["art", "craft", "diy", "do it yourself"],
            "handmade": ["art", "craft", "handmade", "homemade"],
            "homemade": ["art", "craft", "handmade", "homemade"],
            "hobby": ["art", "craft", "hobby", "pastime", "leisure"],
            "pastime": ["art", "craft", "hobby", "pastime"],
            "leisure": ["art", "craft", "hobby", "leisure"],
            "drawing": ["art", "drawing", "sketch", "sketching", "pencil drawing", "charcoal"],
            "sketch": ["art", "drawing", "sketch", "sketching", "outline"],
            "sketching": ["art", "drawing", "sketch", "sketching"],
            "pencil drawing": ["art", "drawing", "pencil drawing"],
            "charcoal": ["art", "drawing", "charcoal", "sketch"],
            "painting": ["art", "painting", "paint", "watercolor", "oil paint", "acrylic", "canvas"],
            "paint": ["art", "painting", "paint", "color", "watercolor", "oil paint", "acrylic"],
            "watercolor": ["art", "painting", "paint", "watercolor", "water colour"],
            "water colour": ["art", "painting", "paint", "watercolor", "water colour"],
            "oil paint": ["art", "painting", "paint", "oil paint", "oil colour"],
            "oil colour": ["art", "painting", "paint", "oil paint", "oil colour"],
            "acrylic": ["art", "painting", "paint", "acrylic", "acrylic paint"],
            "acrylic paint": ["art", "painting", "paint", "acrylic", "acrylic paint"],
            "color": ["art", "paint", "color", "colors", "colour", "colours", "crayon", "pastel"],
            "colors": ["art", "paint", "color", "colors"],
            "colour": ["art", "paint", "color", "colour", "colours"],
            "colours": ["art", "paint", "color", "colour", "colours"],
            "crayon": ["art", "color", "crayon", "crayons", "wax color"],
            "crayons": ["art", "color", "crayon", "crayons"],
            "wax color": ["art", "color", "crayon", "wax color"],
            "pastel": ["art", "color", "pastel", "pastels", "oil pastel"],
            "pastels": ["art", "color", "pastel", "pastels"],
            "oil pastel": ["art", "color", "pastel", "oil pastel"],
            "canvas": ["art", "painting", "canvas", "board", "sheet"],
            "board": ["art", "canvas", "board", "drawing board"],
            "drawing board": ["art", "canvas", "board", "drawing board"],
            "art brush": ["art", "paint", "brush", "art brush", "paint brush"],
            "paint brush": ["art", "paint", "brush", "paint brush"],
            "art palette": ["art", "paint", "palette", "color palette", "mixing tray"],
            "color palette": ["art", "paint", "palette", "color palette"],
            "mixing tray": ["art", "paint", "palette", "mixing tray"],
            "easel": ["art", "painting", "easel", "stand"],
            "stand": ["art", "easel", "stand"],
            "clay": ["art", "craft", "clay", "modeling clay", "pottery", "sculpture"],
            "modeling clay": ["art", "craft", "clay", "modeling clay"],
            "pottery": ["art", "craft", "clay", "pottery", "ceramic"],
            "ceramic": ["art", "craft", "pottery", "ceramic"],
            "origami": ["art", "craft", "origami", "paper craft", "folding"],
            "paper craft": ["art", "craft", "origami", "paper craft"],
            "folding": ["art", "craft", "origami", "folding"],
            "bead": ["art", "craft", "bead", "beads", "jewelry making"],
            "beads": ["art", "craft", "bead", "beads"],
            "jewelry making": ["art", "craft", "bead", "jewelry making"],
            "sewing": ["art", "craft", "sewing", "knitting", "embroidery", "needlework", "thread", "needle"],
            "knitting": ["art", "craft", "sewing", "knitting", "yarn", "wool"],
            "embroidery": ["art", "craft", "sewing", "embroidery", "needlework"],
            "needlework": ["art", "craft", "sewing", "embroidery", "needlework"],
            "thread": ["art", "craft", "sewing", "thread", "yarn", "string"],
            "yarn": ["art", "craft", "knitting", "yarn", "wool"],
            "wool": ["art", "craft", "knitting", "yarn", "wool"],
            "needle": ["art", "craft", "sewing", "needle", "pin"],
            "string": ["art", "craft", "thread", "string", "twine"],
            "twine": ["art", "craft", "string", "twine"],
            
            // ========== GENERAL / COMMON ==========
            "gift": ["gift", "gifts", "present", "presents", "surprise", "birthday", "anniversary", "wedding", "occasion"],
            "gifts": ["gift", "gifts", "present", "presents"],
            "present": ["gift", "present", "presents", "gift item"],
            "presents": ["gift", "present", "presents"],
            "surprise": ["gift", "surprise", "unexpected", "delight"],
            "birthday": ["gift", "birthday", "bday", "birth day", "celebration", "party"],
            "bday": ["gift", "birthday", "bday"],
            "birth day": ["gift", "birthday", "birth day"],
            "celebration": ["gift", "birthday", "celebration", "party", "festive"],
            "party": ["gift", "birthday", "celebration", "party", "event"],
            "anniversary": ["gift", "anniversary", "wedding anniversary", "marriage"],
            "wedding": ["gift", "wedding", "marriage", "bridal", "groom"],
            "marriage": ["gift", "wedding", "marriage"],
            "bridal": ["gift", "wedding", "bridal", "bride"],
            "bride": ["gift", "wedding", "bridal", "bride"],
            "groom": ["gift", "wedding", "groom"],
            "occasion": ["gift", "occasion", "event", "special", "moment"],
            "event": ["gift", "occasion", "event", "function"],
            "special": ["gift", "occasion", "special", "unique", "exclusive"],
            "unique": ["gift", "special", "unique", "rare"],
            "exclusive": ["gift", "special", "exclusive", "limited"],
            "new": ["new", "latest", "brand new", "fresh", "recent", "just arrived"],
            "latest": ["new", "latest", "brand new", "trending", "hot"],
            "brand new": ["new", "brand new", "fresh"],
            "fresh": ["new", "fresh", "newly"],
            "recent": ["new", "recent", "latest"],
            "just arrived": ["new", "just arrived", "new arrival"],
            "new arrival": ["new", "new arrival", "just arrived"],
            "trending": ["new", "latest", "trending", "hot", "popular", "viral"],
            "hot": ["new", "trending", "hot", "bestselling"],
            "bestselling": ["new", "trending", "hot", "bestselling", "top selling"],
            "top selling": ["new", "trending", "bestselling", "top selling"],
            "viral": ["new", "trending", "viral", "viral product"],
            "sale": ["sale", "discount", "offer", "deal", "promo", "clearance", "bargain", "cheap", "low price"],
            "discount": ["sale", "discount", "offer", "deal", "percentage off", "markdown"],
            "offer": ["sale", "discount", "offer", "deal", "special offer", "limited offer"],
            "deal": ["sale", "discount", "offer", "deal", "best deal", "steal"],
            "promo": ["sale", "discount", "promo", "promotion", "promotional"],
            "promotion": ["sale", "discount", "promo", "promotion"],
            "promotional": ["sale", "discount", "promo", "promotional"],
            "clearance": ["sale", "discount", "clearance", "stock clearance"],
            "stock clearance": ["sale", "discount", "clearance", "stock clearance"],
            "bargain": ["sale", "discount", "bargain", "steal", "value"],
            "steal": ["sale", "discount", "bargain", "steal"],
            "cheap": ["sale", "discount", "cheap", "affordable", "budget", "low cost"],
            "affordable": ["sale", "discount", "cheap", "affordable", "budget"],
            "budget": ["sale", "discount", "cheap", "budget", "economy"],
            "economy": ["sale", "discount", "budget", "economy"],
            "low price": ["sale", "discount", "cheap", "low price", "reduced"],
            "low cost": ["sale", "discount", "cheap", "low cost"],
            "reduced": ["sale", "discount", "reduced", "slashed"],
            "slashed": ["sale", "discount", "slashed", "cut price"],
            "cut price": ["sale", "discount", "cut price"],
            "percentage off": ["sale", "discount", "percentage off", "% off", "percent off"],
            "% off": ["sale", "discount", "percentage off", "% off"],
            "percent off": ["sale", "discount", "percentage off", "percent off"],
            "special offer": ["sale", "discount", "offer", "special offer"],
            "limited offer": ["sale", "discount", "offer", "limited offer"],
            "best deal": ["sale", "discount", "deal", "best deal"],
            "value": ["sale", "discount", "bargain", "value", "worth"],
            "worth": ["sale", "discount", "value", "worth"],
            "premium": ["premium", "luxury", "high end", "exclusive", "designer", "branded", "quality", "top"],
            "luxury": ["premium", "luxury", "high end", "lavish", "opulent"],
            "high end": ["premium", "luxury", "high end", "premium quality"],
            "lavish": ["premium", "luxury", "lavish"],
            "opulent": ["premium", "luxury", "opulent"],
            "designer": ["premium", "luxury", "designer", "brand", "label"],
            "branded": ["premium", "branded", "brand", "label", "logo"],
            "brand": ["premium", "branded", "brand", "label"],
            "label": ["premium", "branded", "designer", "label"],
            "logo": ["premium", "branded", "logo"],
            "quality": ["premium", "quality", "high quality", "superior", "excellent", "fine"],
            "high quality": ["premium", "quality", "high quality"],
            "superior": ["premium", "quality", "superior", "better", "best"],
            "excellent": ["premium", "quality", "excellent", "outstanding"],
            "fine": ["premium", "quality", "fine", "refined"],
            "top": ["premium", "top", "best", "leading", "no 1", "number one"],
            "best": ["premium", "top", "best", "finest", "ultimate"],
            "leading": ["premium", "top", "leading", "market leader"],
            "no 1": ["premium", "top", "no 1", "number one"],
            "number one": ["premium", "top", "no 1", "number one"],
            "finest": ["premium", "best", "finest"],
            "ultimate": ["premium", "best", "ultimate"],
            "market leader": ["premium", "leading", "market leader"],
            
            // Default fallback
        };

        // Get related words for search term
        const wordsToSearch = relatedWords[searchTerm] || [searchTerm];
        
        // Create OR conditions for all related words
        const orConditions = [];
        
        wordsToSearch.forEach(word => {
            const wordRegex = new RegExp(word, "i");
            orConditions.push(
                { name: { $regex: wordRegex } },
                { description: { $regex: wordRegex } },
                { "category.main": { $regex: wordRegex } },
                { "category.sub": { $regex: wordRegex } },
                { brand: { $regex: wordRegex } },
                { tags: { $in: [wordRegex] } }
            );
        });

        const products = await Product.find({
            $or: orConditions
        }).limit(50);

        res.json({ products });
    } catch (error) {
        console.log("Error in searchProducts:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};