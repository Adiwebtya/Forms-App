import type { Request, Response } from 'express';
import Form from '../models/Form.js';
import ResponseModel from '../models/Response.js';
import { generateFormSchema, generateEmbedding } from '../lib/gemini.js';
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

        // 1. Generate embedding for the new prompt
        const promptEmbedding = await generateEmbedding(prompt);

        // 2. Search for relevant past forms (Vector Search)
        // Note: This requires an Atlas Vector Search Index named "vector_index"
        let context = '';
        try {
            const similarForms = await Form.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: promptEmbedding,
                        numCandidates: 100,
                        limit: 3,
                        filter: { userId: { $eq: userId } } // Ensure we only search user's own forms
                    }
                },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        content: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            if (similarForms.length > 0) {
                context = similarForms.map(f =>
                    `Title: ${f.title}\nDescription: ${f.content.description}\nFields: ${JSON.stringify(f.content.fields)}`
                ).join('\n---\n');
                console.log('Found similar forms:', similarForms.map(f => f.title));
            }
        } catch (err) {
            console.warn('Vector search failed (likely no index yet):', err);
            // Continue without context if vector search fails
        }

        // 3. Generate Schema with Context
        const schema = await generateFormSchema(prompt, context);

        // 4. Generate summary embedding for the NEW form
        const summaryText = `Title: ${schema.title}\nDescription: ${schema.description}\nFields: ${JSON.stringify(schema.fields)}`;
        const newFormEmbedding = await generateEmbedding(summaryText);

        // 5. Save to database
        const form = new Form({
            userId,
            title: schema.title || 'Untitled Form',
            content: schema,
            embedding: newFormEmbedding
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

export const getFormById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const form = await Form.findById(id);

        if (!form) {
            res.status(404).json({ message: 'Form not found' });
            return;
        }

        res.json(form);
    } catch (error) {
        console.error('Get form by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const submitResponse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const content = req.body;

        const form = await Form.findById(id);
        if (!form) {
            res.status(404).json({ message: 'Form not found' });
            return;
        }

        const response = new ResponseModel({
            formId: id,
            content,
        });

        await response.save();
        res.status(201).json({ message: 'Response submitted successfully' });
    } catch (error) {
        console.error('Submit response error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const form = await Form.findOne({ _id: id, userId });
        if (!form) {
            res.status(404).json({ message: 'Form not found or unauthorized' });
            return;
        }

        const submissions = await ResponseModel.find({ formId: id }).sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
