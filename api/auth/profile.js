export default function handler(req, res) {
  res.status(200).json({
    success: true,
    user: {
      _id: "1",
      name: "Guest User",
      email: "guest@example.com",
      role: "user",
      cartItems: []
    }
  });
}