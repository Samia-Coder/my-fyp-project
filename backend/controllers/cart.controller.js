import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        // 👈 FIX: user.cartItems mein product ObjectId store hain
        const productIds = req.user.cartItems.map(item => 
            typeof item === 'object' ? item.product : item
        );
        
        const products = await Product.find({ _id: { $in: productIds } });
        
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => {
                const cartProductId = typeof cartItem === 'object' ? cartItem.product : cartItem;
                return cartProductId.toString() === product._id.toString();
            });
            return { 
                ...product.toJSON(), 
                quantity: typeof item === 'object' ? item.quantity : 1 
            };
        });

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        
        // 👈 FIX: Check karo ke cartItems mein already hai ya nahi
        const existingItemIndex = user.cartItems.findIndex((item) => {
            const itemProductId = typeof item === 'object' ? item.product : item;
            return itemProductId.toString() === productId;
        });

        if (existingItemIndex >= 0) {
            // Agar object hai toh quantity badhao
            if (typeof user.cartItems[existingItemIndex] === 'object') {
                user.cartItems[existingItemIndex].quantity += 1;
            } else {
                // Agar sirf ID hai toh object banao
                user.cartItems[existingItemIndex] = {
                    product: productId,
                    quantity: 2
                };
            }
        } else {
            user.cartItems.push({
                product: productId,
                quantity: 1
            });
        }

        await user.save();
        
        // Updated cart return karo
        const productIds = user.cartItems.map(item => 
            typeof item === 'object' ? item.product : item
        );
        const products = await Product.find({ _id: { $in: productIds } });
        const cartItems = products.map((product) => {
            const item = user.cartItems.find((cartItem) => {
                const cartProductId = typeof cartItem === 'object' ? cartItem.product : cartItem;
                return cartProductId.toString() === product._id.toString();
            });
            return { 
                ...product.toJSON(), 
                quantity: typeof item === 'object' ? item.quantity : 1 
            };
        });
        
        res.json(cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => {
                const itemProductId = typeof item === 'object' ? item.product : item;
                return itemProductId.toString() !== productId;
            });
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        
        const existingItemIndex = user.cartItems.findIndex((item) => {
            const itemProductId = typeof item === 'object' ? item.product : item;
            return itemProductId.toString() === productId;
        });

        if (existingItemIndex >= 0) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => {
                    const itemProductId = typeof item === 'object' ? item.product : item;
                    return itemProductId.toString() !== productId;
                });
                await user.save();
                return res.json(user.cartItems);
            }

            if (typeof user.cartItems[existingItemIndex] === 'object') {
                user.cartItems[existingItemIndex].quantity = quantity;
            } else {
                user.cartItems[existingItemIndex] = {
                    product: productId,
                    quantity: quantity
                };
            }
            
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};