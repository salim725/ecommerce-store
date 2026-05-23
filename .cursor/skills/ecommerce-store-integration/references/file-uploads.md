# File Upload Pipeline — ecommerce-store

## Flow
```
Frontend (multipart/form-data)
  → backend/src/middleware/upload.middleware.ts (Multer: memory storage)
  → backend/src/utils/cloudinary.util.ts (upload buffer to Cloudinary)
  → Response: { url, publicId }
  → Frontend saves url to Redux state / displays in UI
```

---

## Backend: Multer + Cloudinary

### Cloudinary Config
```ts
// backend/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;
```

### Multer Middleware
```ts
// backend/src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // keep in memory, upload to cloud

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase())
    && allowed.test(file.mimetype);
  if (isValid) cb(null, true);
  else cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
};

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single('image');

export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter,
}).array('images', 10);
```

### Cloudinary Upload Utility
```ts
// backend/src/utils/cloudinary.util.ts
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = 'ecommerce-store'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(upload);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
```

### Upload Controller
```ts
// backend/src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.util';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const result = await uploadToCloudinary(req.file.buffer, 'ecommerce-store/general');
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId required' });
    await deleteFromCloudinary(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
```

---

## crm_client: Uploading Images (Admin)

```ts
// crm_client/lib/uploadImage.ts
import axiosInstance from '@/lib/axios';

export const uploadProductImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axiosInstance.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data; // { url, publicId }
};
```

### UI: Image Upload Component (crm_client)
```tsx
// crm_client/components/ImageUploader.tsx
'use client';
import { useState, useRef } from 'react';
import { uploadProductImage } from '@/lib/uploadImage';
import Image from 'next/image';

interface Props {
  onUploaded: (result: { url: string; publicId: string }) => void;
}

export default function ImageUploader({ onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const result = await uploadProductImage(file);
      onUploaded(result);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
      {preview && <Image src={preview} alt="Preview" width={200} height={200} className="object-cover" />}
    </div>
  );
}
```

---

## store_front: Displaying Images

Always use Next.js `<Image>` component for images from Cloudinary:

```tsx
// store_front/components/ProductCard.tsx
import Image from 'next/image';
import { Product } from '@/types';

const primaryImage = product.images.find(img => img.isPrimary) ?? product.images[0];

<Image
  src={primaryImage?.url || '/placeholder.jpg'}
  alt={product.name}
  width={400}
  height={400}
  className="object-cover"
  // Add Cloudinary transformation via next.config.js domains
/>
```

### next.config.js (both frontends)
```js
// Add Cloudinary domain for Next.js Image optimization
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};
```