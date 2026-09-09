import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Future feature routers will be mounted here, e.g.:
// router.use('/users', userRoutes);
// router.use('/articles', articleRoutes);
// router.use('/categories', categoryRoutes);

export default router;
