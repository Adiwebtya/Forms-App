import express from 'express';
import { generateForm, getForms, getFormById, submitResponse, getSubmissions } from '../controllers/formController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateForm);
router.get('/', authMiddleware, getForms);
router.get('/:id', getFormById); // Public
router.post('/:id/submit', submitResponse); // Public
router.get('/:id/submissions', authMiddleware, getSubmissions);

export default router;
