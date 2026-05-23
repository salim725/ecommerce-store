import {
  createProductService,
  findProductById,
  findProducts,
  findProductsByCategory,
  softDeleteProductService,
  updateProductService,
} from '../services/products.service.js'
import { deleteFromCloudinary } from '../../../shared/middleware/uploadToCloudinary.middleware.js'
import { Request, Response, NextFunction } from 'express'
import Product, { IProduct } from '../model/product.model.js'
import type { AuthPayload } from '../../../shared/types/auth.types.js'
import {
  PRODUCT_SORT_FIELDS,
  type ProductSortField,
} from '../../../shared/constants/product-sort-fields.js'
import { sendSuccess } from '../../../shared/utils/apiResponse.js'

const getAuth = (req: Request): AuthPayload => req.user as AuthPayload

type ProductFilter = Parameters<typeof Product.find>[0]

export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, minPrice, maxPrice } = req.query

    const conditions: Record<string, unknown> = { isActive: true }

    if (category && typeof category === 'string') {
      conditions.category = category
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.$gte = Number(minPrice)
      if (maxPrice) priceFilter.$lte = Number(maxPrice)
      conditions.price = priceFilter
    }

    const sortOption: Record<string, 1 | -1> = {}

    if (req.query.sort && typeof req.query.sort === 'string') {
      const rawField = req.query.sort.startsWith('-')
        ? req.query.sort.substring(1)
        : req.query.sort
      if ((PRODUCT_SORT_FIELDS as readonly string[]).includes(rawField)) {
        const field = rawField as ProductSortField
        sortOption[field] = req.query.sort.startsWith('-') ? -1 : 1
      }
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const { products, total, totalPages } = await findProducts(
      conditions as unknown as ProductFilter,
      sortOption,
      page,
      limit,
    )

    res.status(200).json({
      status: 200,
      message: 'Fetch all products',
      page,
      limit,
      total,
      totalPages,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = req.params.id as string

  try {
    const product = await findProductById(id)

    if (!product || !product.isActive) {
      res.status(404).json({ status: 404, message: 'product not found', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'found product', data: product })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, price, stock, category } = req.body

    const product = await createProductService({
      name,
      description,
      price,
      stock,
      category,
      images: req.imageUrls || [],
      imagePublicIds: req.imagePublicIds || [],
    })

    res.status(201).json({
      status: 201,
      message: 'Product created successfully',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export const getProductsByCatgory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cat = req.params.cat as string
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || undefined
    const { products, total, totalPages, limit: pageLimit } = await findProductsByCategory(
      cat,
      page,
      limit,
    )

    if (products.length === 0) {
      res.status(404).json({
        status: 404,
        message: 'No products found in this category',
        data: [],
      })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'Products fetched successfully',
      page,
      limit: pageLimit,
      total,
      totalPages,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string
    const { name, description, price, stock, category } = req.body

    const updateData: Partial<IProduct> = { name, description, price, stock, category }

    if (req.imageUrls && req.imageUrls.length > 0) {
      const existingProduct = await findProductById(id)
      if (existingProduct && existingProduct.images.length > 0) {
        await Promise.all(
          existingProduct.images.map((url, i) =>
            deleteFromCloudinary(url, existingProduct.imagePublicIds?.[i]),
          ),
        )
      }
      updateData.images = req.imageUrls
      updateData.imagePublicIds = req.imagePublicIds || []
    }

    const updatedProduct = await updateProductService(id, updateData)

    if (!updatedProduct) {
      res.status(404).json({ status: 404, message: 'Product not found', data: null })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'Product updated successfully',
      data: updatedProduct,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string
    const deletedProduct = await softDeleteProductService(id)

    if (!deletedProduct) {
      res.status(404).json({ status: 404, message: 'Product not found', data: null })
      return
    }

    if (deletedProduct.images.length > 0) {
      await Promise.all(
        deletedProduct.images.map((url, i) =>
          deleteFromCloudinary(url, deletedProduct.imagePublicIds?.[i]),
        ),
      )
    }

    res.status(200).json({
      status: 200,
      message: 'Product soft deleted successfully',
      data: deletedProduct,
    })
  } catch (error) {
    next(error)
  }
}

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string
    const product = await Product.findById(id)
      .select('rating averageRating name')
      .populate('rating.user', 'name')
      .lean()

    if (!product || !product.isActive) {
      res.status(404).json({ success: false, status: 404, message: 'Product not found', data: null })
      return
    }

    sendSuccess(
      res,
      200,
      {
        reviews: product.rating ?? [],
        averageRating: product.averageRating,
        totalReviews: product.rating?.length ?? 0,
      },
      { message: 'Reviews fetched successfully' },
    )
  } catch (error) {
    next(error)
  }
}

export const addProductReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string
    const { rating, comment } = req.body
    const { userId } = getAuth(req)

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        status: 400,
        message: 'Rating must be between 1 and 5',
        data: null,
      })
      return
    }

    const product = await Product.findById(id)

    if (!product || !product.isActive) {
      res.status(404).json({ status: 404, message: 'Product not found', data: null })
      return
    }

    if (!product.rating) {
      product.rating = []
    }

    const alreadyReviewed = product.rating.find(
      (review) => review.user.toString() === userId,
    )

    if (alreadyReviewed) {
      res.status(400).json({
        status: 400,
        message: 'You already reviewed this product',
        data: null,
      })
      return
    }

    product.rating.push({
      user: userId as unknown as import('mongoose').Types.ObjectId,
      rating: Number(rating),
      comment,
    })

    const total = product.rating.reduce((sum, item) => sum + item.rating, 0)
    product.averageRating = Number((total / product.rating.length).toFixed(1))

    await product.save()

    res.status(201).json({
      status: 201,
      message: 'Review added successfully',
      data: {
        averageRating: product.averageRating,
        totalReviews: product.rating.length,
      },
    })
  } catch (error) {
    next(error)
  }
}
