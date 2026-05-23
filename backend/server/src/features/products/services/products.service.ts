import Product, { IProduct } from '../model/product.model.js'
import { MAX_CATEGORY_PRODUCTS } from '../../../shared/constants/product-sort-fields.js'

type ProductFilter = Parameters<typeof Product.find>[0]

export const findProducts = async (
  filter: ProductFilter,
  sortOption: Record<string, 1 | -1>,
  page: number,
  limit: number,
) => {
  const currentPage = Number(page) || 1
  const pageSize = Number(limit) || 10
  const skip = (currentPage - 1) * pageSize

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(pageSize).lean(),
    Product.countDocuments(filter),
  ])

  return {
    products,
    page: currentPage,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const findProductById = async (id: string) => {
  return Product.findById(id).lean()
}

export const findProductsByCategory = async (
  category: string,
  page = 1,
  limit = MAX_CATEGORY_PRODUCTS,
) => {
  const currentPage = Number(page) || 1
  const pageSize = Math.min(Number(limit) || MAX_CATEGORY_PRODUCTS, MAX_CATEGORY_PRODUCTS)
  const skip = (currentPage - 1) * pageSize

  const [products, total] = await Promise.all([
    Product.find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Product.countDocuments({ category, isActive: true }),
  ])

  return {
    products,
    page: currentPage,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const createProductService = async (data: Partial<IProduct>) => {
  return Product.create(data)
}

export const updateProductService = async (id: string, data: Partial<IProduct>) => {
  return Product.findByIdAndUpdate(id, data, { returnDocument: 'after' })
}

export const softDeleteProductService = async (id: string) => {
  return Product.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' })
}
