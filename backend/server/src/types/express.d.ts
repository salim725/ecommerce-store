import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string
      imageUrls?: string[]
      imagePublicIds?: string[]
      uploadedImages?: import('../shared/middleware/uploadToCloudinary.middleware.js').UploadedImage[]
    }
  }
}
