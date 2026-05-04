export default function handler(req, res) {
  res.status(200).json({
    success: true,
    categories: [
      { _id: "1", name: "Electronics", image: "https://via.placeholder.com/150" },
      { _id: "2", name: "Fashion", image: "https://via.placeholder.com/150" },
      { _id: "3", name: "Home", image: "https://via.placeholder.com/150" },
      { _id: "4", name: "Sports", image: "https://via.placeholder.com/150" }
    ]
  });
}