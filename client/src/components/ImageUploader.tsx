import { Upload, X } from 'lucide-react';
import { useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  disabled?: boolean;
}

function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setFileName(file.name);
      onImageSelect(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    onImageSelect(null);
  };

  return (
    <div>
      <label className='block text-sm font-medium text-zinc-100 mb-2'>
        Reference Image <span className='text-zinc-400 text-xs'>(optional)</span>
      </label>
      <p className='text-xs text-zinc-400 mb-3'>Upload an image to help the AI understand your vision better</p>

      {!preview ? (
        <label htmlFor="image-upload" className={`block w-full px-4 py-6 rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-zinc-400" />
            <div className="text-center">
              <p className="text-sm text-zinc-300">Click to upload</p>
              <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative rounded-lg border border-white/20 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 truncate">{fileName}</p>
              <p className="text-xs text-zinc-500">Reference image uploaded</p>
            </div>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove image"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;