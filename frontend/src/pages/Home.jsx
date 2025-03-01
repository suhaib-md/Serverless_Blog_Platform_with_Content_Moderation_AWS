import { useEffect, useState } from "react";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // 🔥 Loading state

  useEffect(() => {
    fetch("https://5gf9bw2b43.execute-api.us-east-1.amazonaws.com/prod/get-posts")
      .then((res) => res.json())
      .then((data) => {
        try {
          const parsedData = JSON.parse(data.body);
          if (Array.isArray(parsedData)) {
            setPosts(parsedData);
          } else {
            console.error("Unexpected API response:", parsedData);
          }
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false)); // ✅ Stop loading
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">📖 Latest Blog Posts</h2>

      {/* 🔥 Loading Skeleton */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 p-4 rounded-lg h-56"></div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.PostID}
              className="bg-white p-4 shadow-lg rounded-lg transform transition hover:scale-105 hover:shadow-2xl"
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <h3 className="text-xl font-semibold mt-3 text-gray-800">{post.title}</h3>
              <p className="text-gray-600 mt-2">{post.content.substring(0, 100)}...</p>
              <button className="mt-3 text-blue-600 hover:text-blue-800">Read more →</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center text-lg mt-6">No posts available. 📭</p>
      )}
    </div>
  );
};

export default Home;
