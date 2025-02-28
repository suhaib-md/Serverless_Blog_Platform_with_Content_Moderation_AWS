import { useEffect, useState } from "react";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("https://5gf9bw2b43.execute-api.us-east-1.amazonaws.com/prod/get-posts")
      .then((res) => res.json())
      .then((data) => {
        try {
          const parsedData = JSON.parse(data.body); // 🔥 FIX: Ensure JSON parsing
          if (Array.isArray(parsedData)) {
            setPosts(parsedData);
          } else {
            console.error("Unexpected API response:", parsedData);
          }
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);
  
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Latest Blog Posts</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.postId} className="bg-white p-4 shadow-md rounded-lg">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover rounded-md" />
              )}
              <h3 className="text-xl font-semibold mt-2">{post.title}</h3>
              <p className="text-gray-600">{post.content.substring(0, 100)}...</p>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
