import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const createCODOrder = async (req, res) => {
    try {
        const { products, couponCode, totalAmount, shippingAddress } = req.body;
        const userId = req.user._id;

        if (!products || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Validation
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
            return res.status(400).json({
                success: false,
                message: "Please provide complete shipping address"
            });
        }

        // Stock check...
        for (const item of products) {
            const product = await Product.findById(item._id || item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.name || item._id}`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }
        }

        const order = await Order.create({
            user: userId,
            products: products.map(item => ({
                product: item._id || item.product,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image
            })),
            totalAmount,
            couponCode: couponCode || null,
            paymentMethod: "cod",
            paymentStatus: "pending",
            orderStatus: "placed",
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                address: shippingAddress.address,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country || "Pakistan"
            }
        });

        // Decrease stock
        for (const item of products) {
            await Product.findByIdAndUpdate(item._id || item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully! Pay cash on delivery.",
            orderId: order._id
        });

    } catch (error) {
        console.error("COD Order Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to place order"
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean(); // lean() use karein taake plain objects milein

        // Manual populate with error handling
        const populatedOrders = await Promise.all(
            orders.map(async (order) => {
                const populatedProducts = await Promise.all(
                    order.products.map(async (item) => {
                        try {
                            const product = await Product.findById(item.product).lean();
                            return {
                                ...item,
                                name: item.name || product?.name || "Unknown Product",
                                image: item.image || product?.image || "",
                                price: item.price || product?.price || 0
                            };
                        } catch (e) {
                            return {
                                ...item,
                                name: item.name || "Unknown Product",
                                image: item.image || "",
                                price: item.price || 0
                            };
                        }
                    })
                );
                
                return {
                    ...order,
                    products: populatedProducts,
                    _id: order._id.toString()
                };
            })
        );

        res.status(200).json({
            success: true,
            orders: populatedOrders
        });

    } catch (error) {
        console.error("Get My Orders Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch orders"
        });
    }
};