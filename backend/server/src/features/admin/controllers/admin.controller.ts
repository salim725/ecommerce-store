import { Request, Response, NextFunction } from 'express'
import { getAdminStats } from '../services/admin.service.js'

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await getAdminStats()
    res.status(200).json({
      status: 200,
      message: 'Admin stats fetched successfully',
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}
