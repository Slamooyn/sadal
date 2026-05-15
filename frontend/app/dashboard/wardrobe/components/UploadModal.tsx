"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = [
  { value: "shirt", label: "Shirt (Baju/Atasan)" },
  { value: "pants", label: "Pants (Celana)" },
  { value: "shoes", label: "Shoes (Sepatu)" },
];

const THEMES = [
  { value: "winter", label: "Winter Clothes" },
  { value: "summer", label: "Summer Clothes" },
  { value: "sporty", label: "Sport Clothes"  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [theme, setTheme] = useState("");
  const [name, setName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setType("");
    setTheme("");
    setName("");
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  const handleFile = (selectedFile: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    setError(null);
    if (!file) {
      setError("Please select an image.");
      return;
    }
    if (!type) {
      setError("Please select a clothing type.");
      return;
    }
    if (!theme) {
      setError("Please select a theme.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("theme", theme);
      if (name) formData.append("name", name);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      resetForm();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong during upload.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Upload Wardrobe</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
              ${isDragging ? "border-[#4361ee] bg-[#4361ee]/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
              ${previewUrl ? "border-solid border-gray-200 bg-gray-50 p-2" : ""}
              ${isLoading ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {previewUrl ? (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Upload size={18} /> Change Photo
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="size-14 rounded-full bg-[#4361ee]/10 flex items-center justify-center text-[#4361ee]">
                  <ImageIcon size={28} />
                </div>
                <div className="text-center">
                  <p className="text-gray-800 font-medium">Click or drag photo here</p>
                  <p className="text-gray-500 text-sm mt-1">JPG, PNG or WebP (max. 10MB)</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
              <select
                disabled={isLoading}
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] disabled:opacity-50"
              >
                <option value="">Select a type</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Theme <span className="text-red-500">*</span></label>
              <select
                disabled={isLoading}
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] disabled:opacity-50"
              >
                <option value="">Select a theme</option>
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Item Name <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                disabled={isLoading}
                type="text"
                placeholder="e.g. My Favorite Blue Shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-[#4361ee] font-medium text-white hover:bg-[#3451d6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Upload Photo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
