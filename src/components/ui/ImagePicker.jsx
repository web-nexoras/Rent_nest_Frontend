import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

/**
 * Image picker with previews. Calls onChange(File[]). Validates the backend's
 * limits (JPEG/PNG/WEBP, 2MB each, max `max` files) before upload.
 */
export default function ImagePicker({ label, max = 3, multiple = true, onChange, error, existing = [] }) {
  const [files, setFiles] = useState([]);
  const [localError, setLocalError] = useState("");
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handleChange = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (picked.some((file) => !allowed.includes(file.type))) {
      setLocalError("Only JPEG, PNG and WEBP images are allowed");
      return;
    }
    if (picked.some((file) => file.size > 2 * 1024 * 1024)) {
      setLocalError("Each image must be 2MB or smaller");
      return;
    }
    const next = multiple ? [...files, ...picked].slice(0, max) : picked.slice(0, 1);
    if (multiple && files.length + picked.length > max) {
      setLocalError(`You can upload up to ${max} images`);
    } else {
      setLocalError("");
    }
    setFiles(next);
    onChange(next);
  };

  const remove = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onChange(next);
    setLocalError("");
  };

  const shownError = localError || error;

  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-navy-800">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {existing.length > 0 &&
          files.length === 0 &&
          existing.map((src) => (
            <img key={src} src={src} alt="" className="h-20 w-20 rounded-xl border border-navy-100 object-cover" />
          ))}
        {previews.map((src, index) => (
          <div key={src} className="relative">
            <img src={src} alt="" className="h-20 w-20 rounded-xl border border-navy-100 object-cover" />
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute -right-2 -top-2 rounded-full bg-navy-900 p-1 text-white shadow"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {(multiple ? files.length < max : files.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-navy-200 text-navy-300 transition hover:border-brand-500 hover:text-brand-500"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <p className="text-xs text-navy-400">JPEG, PNG or WEBP · max 2MB each{multiple ? ` · up to ${max}` : ""}</p>
      {shownError && <p className="text-xs font-medium text-red-500">{shownError}</p>}
    </div>
  );
}
