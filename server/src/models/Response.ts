import mongoose, { Schema, type Document } from 'mongoose';

export interface IResponse extends Document {
    formId: mongoose.Types.ObjectId;
    content: any;
    submittedAt: Date;
}

const ResponseSchema: Schema = new Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    content: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IResponse>('Response', ResponseSchema);
