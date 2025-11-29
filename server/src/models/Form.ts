import mongoose, { Schema, type Document } from 'mongoose';

export interface IForm extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    content: any; // Flexible content for now
    createdAt: Date;
    updatedAt: Date;
}

const FormSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model<IForm>('Form', FormSchema);
