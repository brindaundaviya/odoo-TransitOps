import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'TransitOps Backend Running',
    });
  }),
);

router.use('/auth', authRoutes);

export default router;
