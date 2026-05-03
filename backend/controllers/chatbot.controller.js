import dotenv from "dotenv";
dotenv.config();

const chatHistories = new Map();

// Smart fallback responses
const getSmartResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    const responses = [
        {
            keywords: ["hello", "hi", "hey", "salam", "assalam"],
            response: "Hello! 👋 Welcome to SafiraMart! I'm your AI assistant. How can I help you today?"
        },
        {
            keywords: ["deal", "sale", "discount", "offer", "cheap"],
            response: "🎉 We have amazing deals right now!\n\n• Summer Sale: Up to 50% off\n• New User: Extra 10% off\n• Free shipping on orders above $50\n\nCheck out our Deals section!"
        },
        {
            keywords: ["laptop", "computer", "pc", "macbook"],
            response: "💻 Our best laptops:\n\n• Dell Inspiron 15 - $599\n• MacBook Air M3 - $1099\n• ASUS ROG Strix - $1499\n• HP Pavilion - $449\n\nWhich one interests you?"
        },
        {
            keywords: ["phone", "mobile", "iphone", "samsung", "android"],
            response: "📱 Top phones:\n\n• iPhone 15 Pro - $999\n• Samsung S24 Ultra - $1199\n• Google Pixel 8 - $699\n• OnePlus 12 - $799\n\nAll with 1-year warranty!"
        },
        {
            keywords: ["fashion", "clothes", "dress", "shirt", "shoe"],
            response: "👗 Fashion Collection:\n\n• Summer 2026 - New Arrivals\n• Casual Wear from $29\n• Formal Wear 30% off\n• Shoes & Accessories: Buy 2 Get 1 Free\n\nWhat style are you looking for?"
        },
        {
            keywords: ["order", "track", "shipping", "delivery"],
            response: "📦 Order Tracking:\n\n1. Go to 'My Orders' in your account\n2. Use tracking number from email\n3. Or provide your order ID here\n\nStandard: 2-3 days\nExpress: Same day (select cities)"
        },
        {
            keywords: ["return", "refund", "exchange"],
            response: "🔄 Return Policy:\n\n• 30-day easy returns\n• Free return shipping\n• Full refund or exchange\n• No questions asked\n\nGo to 'My Orders' → 'Return Item'"
        },
        {
            keywords: ["size", "fit", "measurement"],
            response: "📏 Size Guide:\n\n• Small: Chest 34-36\" | Waist 28-30\"\n• Medium: Chest 38-40\" | Waist 32-34\"\n• Large: Chest 42-44\" | Waist 36-38\"\n• XL: Chest 46-48\" | Waist 40-42\"\n\nNeed help finding your size? Tell me your height and weight!"
        },
        {
            keywords: ["payment", "card", "cod", "cash", "paypal"],
            response: "💳 We accept:\n\n• Credit/Debit Cards (Visa, Mastercard)\n• PayPal, Apple Pay, Google Pay\n• Cash on Delivery (COD)\n• Bank Transfer\n\nAll transactions are 256-bit SSL encrypted!"
        },
        {
            keywords: ["help", "support", "contact", "agent"],
            response: "🎧 Support Options:\n\n• Live Chat: 24/7\n• Email: support@safiramart.com\n• Phone: 1-800-STORE\n• WhatsApp: +1-234-567-8900\n\nI'm also here to help!"
        },
        {
            keywords: ["gift", "present", "birthday"],
            response: "🎁 Gift Ideas:\n\nUnder $30: Scented candles, keychains, mugs\nUnder $50: Watches, perfumes, accessories\nUnder $100: Headphones, bags, jewelry\nPremium: Smartwatches, designer items\n\nWant specific suggestions?"
        },
        {
            keywords: ["account", "login", "signup", "register"],
            response: "🔐 Account Help:\n\n• New user? Sign up and get 10% off!\n• Forgot password? Click 'Reset Password'\n• Already have an account? Login to see your orders\n\nCreating an account takes less than 30 seconds!"
        }
    ];

    for (const item of responses) {
        if (item.keywords.some(k => lowerMsg.includes(k))) {
            return item.response;
        }
    }

    const defaults = [
        "That's a great question! 😊 Let me help you with that. Could you tell me more about what you're looking for?",
        "I'd love to help! Can you share more details? For example, your budget or preferred brand?",
        "Sure thing! We have several options. Would you like to see our bestsellers or newest arrivals?",
        "Absolutely! Let me find the best options for you. Any preferences for color, size, or brand?",
        "Interesting! I can help with that. What specific features are you looking for?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
};

export const chatWithAI = async (req, res) => {
    try {
        const { message, sessionId = "default" } = req.body;
        
        console.log("📩 Received:", message);

        if (!message || !message.trim()) {
            return res.status(400).json({ 
                success: false,
                error: "Message is required" 
            });
        }

        // Get or create history
        if (!chatHistories.has(sessionId)) {
            chatHistories.set(sessionId, []);
        }
        const history = chatHistories.get(sessionId);

        let aiText = "";

        // ✅ Try Groq API
        try {
            if (!process.env.GROQ_API_KEY) {
                throw new Error("GROQ_API_KEY not found in .env");
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are SafiraMart's friendly AI shopping assistant. Help customers with products, orders, and shopping advice. Be concise, helpful, and professional. Use emojis where appropriate."
                        },
                        ...history.slice(-4).map(h => ({
                            role: h.role === "model" ? "assistant" : "user",
                            content: h.text
                        })),
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            if (data.choices && data.choices[0] && data.choices[0].message) {
                aiText = data.choices[0].message.content;
                console.log("🤖 Groq Response:", aiText.substring(0, 100));
            } else {
                throw new Error("Invalid response format from Groq");
            }

        } catch (apiError) {
            console.error("⚠️ Groq API failed:", apiError.message);
            console.log("🔄 Using fallback response...");
            
            // Use fallback if API fails
            aiText = getSmartResponse(message);
        }

        // Save to history
        history.push({ role: "user", text: message });
        history.push({ role: "model", text: aiText });
        
        if (history.length > 20) {
            history.splice(0, 2);
        }

        res.json({
            success: true,
            response: aiText,
            sessionId
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        
        res.status(500).json({ 
            success: false,
            error: "Server error. Please try again. 🤖"
        });
    }
};

export const clearChat = async (req, res) => {
    try {
        const { sessionId = "default" } = req.body;
        chatHistories.delete(sessionId);
        res.json({ success: true, message: "Chat cleared" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to clear" });
    }
};

export const healthCheck = async (req, res) => {
    try {
        res.json({ 
            status: "ok", 
            service: "safiramart-ai",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ status: "error", error: error.message });
    }
};