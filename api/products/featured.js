export default function handler(req, res) {
  res.status(200).json([
    { id: 1, name: "Featured Product 1", price: 150, image: "https://via.placeholder.com/150", isFeatured: true },
    { id: 2, name: "Featured Product 2", price: 250, image: "https://via.placeholder.com/150", isFeatured: true }
  ]);
}