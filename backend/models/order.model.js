import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true
                },
                name: String,
                image: String
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        couponCode: {
            type: String,
            default: null
        },
        paymentMethod: {
            type: String,
            enum: ["card", "cod"],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },
        orderStatus: {
            type: String,
            enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
            default: "placed"
        },
        shippingAddress: {  // ← Changed from String to Object
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, default: "Pakistan" }
        },
        stripeSessionId: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;