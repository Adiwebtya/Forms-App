import express from 'express';
import { generateForm, getForms } from '../controllers/formController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateForm);
router.get('/', authMiddleware, getForms);

export default router;
