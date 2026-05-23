import cloudinary from '../../config/cloudinary.js'
import { Request, Response, NextFunction } from 'express'
import { publicIdFromCloudinaryUrl } from '../utils/cloudinary.js'

export type UploadedImage = { url: string; publicId: string }

export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.files || req.files.length === 0) return next()

        const files = req.files as Express.Multer.File[]

        const uploadPromises = files.map(file => {
            return new Promise<UploadedImage>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'products' },
                    (error, result) => {
                        if (error) reject(error)
                        else if (result) {
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                            })
                        }
                        else reject(new Error('No result from Cloudinary'))
                    }
                )
                stream.end(file.buffer)
            })
        })

        const uploaded = await Promise.all(uploadPromises)
        req.uploadedImages = uploaded
        req.imageUrls = uploaded.map((img) => img.url)
        req.imagePublicIds = uploaded.map((img) => img.publicId)
        next()

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Image upload failed',
            data: null
        })
    }
}

export const deleteFromCloudinary = async (
    imageUrl: string,
    publicId?: string,
): Promise<void> => {
    try {
        const resolvedPublicId = publicId ?? publicIdFromCloudinaryUrl(imageUrl)
        if (!resolvedPublicId) {
            console.error('Could not resolve Cloudinary public_id for:', imageUrl)
            return
        }

        await cloudinary.uploader.destroy(resolvedPublicId)
    } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error)
    }
}
