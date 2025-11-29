import express from 'express';
import { generateForm, getForms, getFormById, submitResponse } from '../controllers/formController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateForm);
router.get('/', authMiddleware, getForms);
router.get('/:id', getFormById); // Public
router.post('/:id/submit', submitResponse); // Public

export default router;
