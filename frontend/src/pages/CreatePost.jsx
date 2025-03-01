import { useState } from "react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploadUrl, setUploadUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 🔹 Store error messages

  const getPresignedUrl = async (file) => {
    setIsUploading(true);
    setErrorMessage(""); // Clear previous errors
    try {
      const response = await fetch(
        `https://5gf9bw2b43.execute-api.us-east-1.amazonaws.com/prod/get-upload-url?fileName=${file.name}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch pre-signed URL: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.body);
      if (!parsedData.uploadUrl) throw new Error("No pre-signed URL received");

      setUploadUrl(parsedData.uploadUrl);
    } catch (error) {
      setErrorMessage("⚠️ Error getting pre-signed URL. Please try again.");
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

      const responseData = await response.json();
      const parsedData = JSON.parse(responseData.body);

      if (!response.ok) {
        throw new Error(parsedData.error || "Failed to create post");
      }

      // 🔹 Handle Moderation Warning from API
      if (parsedData.warning) {
        setErrorMessage(parsedData.warning);
        return;
      }

      alert("✅ Blog post created successfully!");
      setTitle("");
      setContent("");
      setImage(null);
      setUploadUrl("");
    } catch (error) {
      setErrorMessage(`⚠️ ${error.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        ✏️ Create a New Blog Post
      </h2>

      {/* 🔹 Display Error Messages */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-600 font-semibold rounded-lg text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-gray-700 font-semibold">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-gray-700 font-semibold">Content</label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
            required
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Upload Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-6 py-3 text-gray-600 text-sm font-medium">
              📷 Choose an Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </label>
          </div>
          {image && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-semibold">{image.name}</span>
            </p>
          )}
          {isUploading && (
            <p className="text-blue-600 text-sm mt-1">Uploading image, please wait...</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "🚀 Publish Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
