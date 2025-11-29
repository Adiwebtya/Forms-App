import type { Request, Response } from 'express';
import Form from '../models/Form.js';
import { generateFormSchema } from '../lib/gemini.js';
import { z } from 'zod';

interface AuthRequest extends Request {
    userId?: string;
}

const generateSchema = z.object({
    prompt: z.string().min(5),
});

export const generateForm = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { prompt } = generateSchema.parse(req.body);
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Call AI to generate schema
        const schema = await generateFormSchema(prompt);

        // Save to database
        const form = new Form({
            userId,
            title: schema.title || 'Untitled Form',
            content: schema,
        });

        await form.save();

        res.status(201).json(form);
    } catch (error) {
        console.error('Form generation error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: error.issues });
        } else {
            res.status(500).json({ message: 'Failed to generate form', error: (error as Error).message });
        }
    }
};

export const getForms = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const forms = await Form.find({ userId }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (error) {
        console.error('Get forms error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
