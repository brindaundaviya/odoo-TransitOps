import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { reportController } from './report.controller';

const router = Router();

router.use(authenticate);

router.get('/summary', reportController.getSummary);
router.get('/export/:type', reportController.exportCSV);

export default router;
