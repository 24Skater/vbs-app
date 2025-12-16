"use client";

import { useState, useRef } from "react";

interface LogoUploadProps {
  name: string;
  currentImage?: string | null;
  className?: string;
}

export default function LogoUpload({
  name,
  currentImage,
  className = "",
}: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate on client side
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File too large. Maximum size is 2MB.");
      return;
    }

    // Convert to base64 for form submission
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setPreview(dataUri);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = dataUri;
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        ref={hiddenInputRef}
        defaultValue={currentImage || ""}
      />

      {preview ? (
        <div className="flex items-start gap-4">
          <div className="relative bg-gray-100 rounded-lg p-4 border border-gray-200">
            <img
              src={preview}
              alt="Logo Preview"
              className="h-16 w-auto max-w-[200px] object-contain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Logo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Upload logo
              </button>
              {" "}or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, SVG, WebP up to 2MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}

