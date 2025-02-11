"use client";
import React, { useState, forwardRef } from "react";

const ImageUploader = forwardRef<HTMLDivElement>((_, ref) => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-md">
      {/* Custom button to trigger file input */}
      <button
        onClick={() => document.getElementById("file-input")?.click()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Upload Image
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        id="file-input"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {/* Display the uploaded image */}
      {image && <img src={image} alt="Uploaded" className="w-64 h-64 object-cover rounded-md shadow-md" />}
    </div>
  );
});

ImageUploader.displayName = "ImageUploader"; // Prevents React warning for forwardRef

export default ImageUploader;
