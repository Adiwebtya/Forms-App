import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = signupSchema.parse(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        console.error('Signup error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: error.issues });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: error.issues });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
};
