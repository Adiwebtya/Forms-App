# AI-Powered Full Stack Forms App

A dynamic form generator that uses Google Gemini AI to create forms from natural language prompts. It features a Context-Aware Memory Layer to learn from your past forms and supports managed media uploads via Cloudinary.

## Features

-   **AI Form Generation**: Describe your form (e.g., "Job application for a senior dev") and get a ready-to-use form instantly.
-   **Context-Aware Memory**: The AI remembers your past forms using Vector Search (MongoDB Atlas + Gemini Embeddings) to maintain consistency in style and structure.
-   **Public Form Links**: Shareable links for users to fill out forms.
-   **Media Uploads**: Integrated Cloudinary support for file uploads in forms.
-   **User Dashboard**: Manage forms and view submissions with image previews.
-   **Secure Authentication**: JWT-based auth with secure password hashing.

## Tech Stack

-   **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, React Hook Form.
-   **Backend**: Express.js, TypeScript, MongoDB (Mongoose).
-   **AI & Search**: Google Gemini API (`gemini-2.5-flash`, `text-embedding-004`), MongoDB Atlas Vector Search.
-   **Storage**: Cloudinary.

## Setup Instructions

### Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas Account (Free Tier is fine)
-   Google Cloud Project with Gemini API enabled
-   Cloudinary Account

### 1. Clone & Install
```bash
git clone <repository-url>
cd fullstack-forms-app
npm install
```

### 2. Environment Variables
Create `server/.env` with the following:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/fullstack-forms-app
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. MongoDB Atlas Vector Search Setup
To enable the Memory Layer, you **MUST** create a Vector Search Index in Atlas:
1.  Go to Atlas Dashboard -> **Atlas Search** -> **Create Search Index**.
2.  Choose **JSON Editor**.
3.  Database: `fullstack-forms-app`, Collection: `forms`.
4.  Index Name: `vector_index`.
5.  Configuration:
    ```json
    {
      "fields": [
        {
          "numDimensions": 768,
          "path": "embedding",
          "similarity": "cosine",
          "type": "vector"
        },
        {
          "path": "userId",
          "type": "filter"
        }
      ]
    }
    ```

### 4. Run the App
From the root directory:
```bash
npm run dev
```
This starts both the Frontend (http://localhost:3000) and Backend (http://localhost:5000).

## Architecture & Scalability

### Context-Aware Memory Layer
To handle users with thousands of past forms without exceeding the LLM context window, we implemented a **Retrieval-Augmented Generation (RAG)** system:
1.  **Embedding**: Every time a form is created, we generate a vector embedding of its summary using `text-embedding-004`.
2.  **Retrieval**: When a new prompt is received, we generate an embedding for the prompt and perform a **Vector Search** in MongoDB to find the top-3 most relevant past forms.
3.  **Generation**: These top-3 forms are injected into the system prompt as "Context", allowing the AI to mimic the user's preferred style.

This ensures scalability: whether a user has 10 or 10,000 forms, we only retrieve the most relevant few, keeping the prompt size constant and efficient.

### Managed Media Uploads
File uploads are handled via **Cloudinary**.
1.  Frontend uploads the file directly to our backend proxy (`/api/upload`).
2.  Backend streams it to Cloudinary and returns a secure URL.
3.  The URL is stored in the form submission data, keeping the database light.

## Limitations
-   **Vector Search Latency**: Indexing new forms takes a few seconds in Atlas. Immediate context retrieval for a brand-new form might have a slight delay.
-   **Rate Limits**: Dependent on Gemini API quotas.
