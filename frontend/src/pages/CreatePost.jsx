import { useState } from "react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploadUrl, setUploadUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const getPresignedUrl = async (file) => {
    setIsUploading(true);
    try {
      const response = await fetch(
        `https://5gf9bw2b43.execute-api.us-east-1.amazonaws.com/prod/get-upload-url?fileName=${file.name}`
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch pre-signed URL: ${response.statusText}`);
      }
  
      const data = await response.json();
      const parsedData = JSON.parse(data.body); // 🔥 FIX: Parse response body
      if (!parsedData.uploadUrl) throw new Error("No pre-signed URL received");
  
      setUploadUrl(parsedData.uploadUrl);
    } catch (error) {
      alert("Error getting pre-signed URL: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    await getPresignedUrl(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !image) {
      alert("All fields are required.");
      return;
    }

    if (!uploadUrl) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    try {
      // Upload image to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: image,
        headers: { "Content-Type": image.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
      }

      const imageUrl = uploadUrl.split("?")[0];

      // Submit blog post
      const response = await fetch(
        "https://5gf9bw2b43.execute-api.us-east-1.amazonaws.com/prod/create-post",
        {
          method: "POST",
          body: JSON.stringify({ title, content, imageUrl }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to create post"}`);
        return;
      }

      alert("Blog post created successfully!");
      setTitle("");
      setContent("");
      setImage(null);
      setUploadUrl("");
    } catch (error) {
      alert("Error creating post: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Title</label>
          <input type="text" className="w-full border p-2 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Content</label>
          <textarea className="w-full border p-2 rounded-md" rows="4" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {isUploading && <p className="text-red-500 text-sm mt-1">Uploading image, please wait...</p>}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
