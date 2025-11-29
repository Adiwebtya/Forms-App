import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'forms-app',
        });

        // Clean up local file
        fs.unlinkSync(req.file.path);

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

export default router;
