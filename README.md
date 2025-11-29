# AI-Powered Forms Application

A full-stack Google Forms clone with AI-powered form generation, built with Next.js, Express, MongoDB, and Google Gemini AI. Features a pixel-perfect Material Design 3 UI and intelligent context-aware form creation using vector embeddings.

## 🎯 Features

- **AI Form Generation**: Describe your form in natural language, get a complete form schema
- **Context-Aware Memory**: Uses MongoDB Atlas Vector Search for semantic context retrieval
- **Google Forms UI**: Pixel-perfect Material Design 3 implementation
- **File Uploads**: Cloudinary integration for media storage
- **Public Form Sharing**: Shareable links for form submissions
- **Response Management**: View and manage form submissions with inline media previews
- **Authentication**: Secure JWT-based user authentication

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (for vector search)
- Google Gemini API key
- Cloudinary account (for file uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/Adiwebtya/Forms-App.git
cd Forms-App
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/forms-db
JWT_SECRET=your-super-secret-jwt-key-change-this
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important**: Create a Vector Search Index in MongoDB Atlas:
1. Go to your MongoDB Atlas cluster
2. Navigate to "Search" → "Create Search Index"
3. Choose "JSON Editor" and use this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

4. Name it `vector_index` and apply to the `contexts` collection

Build and start the server:

```bash
npm run build
npm start
```

For development:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## 📝 Example Prompts & Generated Forms

### Example 1: Event Registration
**Prompt**: `"Create a registration form for a tech conference"`

**Generated Form**:
- Full Name (text, required)
- Email Address (email, required)
- Company/Organization (text)
- Job Title (text)
- Session Preferences (select: Keynote, Workshops, Networking)
- Dietary Requirements (textarea)
- T-Shirt Size (select: S, M, L, XL, XXL)

### Example 2: Customer Feedback
**Prompt**: `"Customer satisfaction survey for a restaurant"`

**Generated Form**:
- Name (text, optional)
- Email (email, optional)
- Visit Date (text)
- Overall Rating (select: Excellent, Good, Average, Poor)
- Food Quality (select: 1-5 stars)
- Service Quality (select: 1-5 stars)
- Comments & Suggestions (textarea)
- Would you recommend us? (checkbox)

### Example 3: Job Application
**Prompt**: `"Job application form for software developer position"`

**Generated Form**:
- Full Name (text, required)
- Email (email, required)
- Phone Number (text, required)
- Resume Upload (file, required)
- Years of Experience (text)
- Programming Languages (textarea)
- Portfolio/GitHub Link (text)
- Cover Letter (textarea)
- Available Start Date (text)

### Example 4: Course Enrollment
**Prompt**: `"Student enrollment form for online courses"`

**Generated Form**:
- Student Name (text, required)
- Email Address (email, required)
- Course Selection (select: Web Development, Data Science, Mobile Apps)
- Education Level (select: High School, Bachelor's, Master's, PhD)
- Previous Experience (textarea)
- Learning Goals (textarea)
- Preferred Schedule (select: Weekdays, Weekends, Flexible)

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- Next.js 16 (App Router)
- Material UI v7 (Material Design 3)
- React Hook Form + Zod validation
- Axios for API calls

**Backend**:
- Express.js
- MongoDB with Mongoose
- Google Gemini AI (`gemini-1.5-flash`, `text-embedding-004`)
- Cloudinary for file storage
- JWT authentication
- Multer for file uploads

### Memory Retrieval System

The application uses a sophisticated context-aware memory system:

1. **Embedding Generation**: When a user submits a form generation prompt, it's converted to a 768-dimensional vector using Google's `text-embedding-004` model.

2. **Vector Search**: MongoDB Atlas Vector Search performs cosine similarity search against stored context embeddings to find the 3 most relevant previous form schemas.

3. **Context Injection**: Retrieved contexts are injected into the Gemini prompt to inform the AI about similar forms created previously, improving consistency and quality.

4. **Schema Generation**: Gemini generates a new form schema based on:
   - User's natural language prompt
   - Retrieved similar form contexts
   - Predefined system instructions for form structure

5. **Context Storage**: The new form schema and its embedding are stored for future context retrieval.

**Flow Diagram**:
```
User Prompt → Embedding Generation → Vector Search (MongoDB Atlas)
                                            ↓
                                    Retrieve Top 3 Contexts
                                            ↓
                        Gemini AI ← System Prompt + Contexts + User Prompt
                                            ↓
                                    Generated Form Schema
                                            ↓
                                Store Schema + Embedding
```

### Database Schema

**Users Collection**:
```javascript
{
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

**Forms Collection**:
```javascript
{
  userId: ObjectId,
  title: String,
  content: {
    description: String,
    fields: [{
      name: String,
      label: String,
      type: String, // text, email, textarea, select, checkbox, file
      required: Boolean,
      options: [String] // for select type
    }]
  },
  createdAt: Date
}
```

**Submissions Collection**:
```javascript
{
  formId: ObjectId,
  content: Object, // key-value pairs of field responses
  submittedAt: Date
}
```

**Contexts Collection** (for vector search):
```javascript
{
  prompt: String,
  schema: Object,
  embedding: [Number], // 768-dimensional vector
  createdAt: Date
}
```

## 📈 Scalability Handling

### Current Implementation

1. **Stateless Backend**: JWT-based authentication allows horizontal scaling
2. **Database Indexing**: Proper indexes on `userId`, `formId`, and vector embeddings
3. **CDN for Media**: Cloudinary handles file storage and delivery
4. **Async Operations**: Non-blocking I/O for all database and API calls

### Recommended Improvements for Production

1. **Caching Layer**:
   - Redis for session management and frequently accessed forms
   - Cache form schemas to reduce database queries
   - Cache vector search results for common prompts

2. **Load Balancing**:
   - Deploy multiple backend instances behind a load balancer
   - Use PM2 or Kubernetes for process management

3. **Database Optimization**:
   - Implement read replicas for MongoDB
   - Use connection pooling (already configured in Mongoose)
   - Archive old submissions to separate collections

4. **API Rate Limiting**:
   - Implement rate limiting per user/IP
   - Queue system for AI generation requests (Bull/BullMQ)

5. **CDN & Asset Optimization**:
   - Serve Next.js static assets via CDN
   - Implement image optimization for uploaded files
   - Use lazy loading for form submissions

6. **Monitoring & Logging**:
   - Application Performance Monitoring (APM) tools
   - Centralized logging (ELK stack or similar)
   - Error tracking (Sentry)

## ⚠️ Limitations

### Current Limitations

1. **Vector Search Dependency**: Requires MongoDB Atlas (not available in self-hosted MongoDB)
2. **AI Generation Costs**: Each form generation consumes Gemini API quota
3. **File Upload Size**: Limited by Cloudinary free tier (10GB storage, 25 credits/month)
4. **No Real-time Updates**: Form submissions don't auto-refresh (requires manual page reload)
5. **Single Language**: UI and generated forms are English-only
6. **No Form Editing**: Once created, forms cannot be edited (only view/delete)
7. **No Analytics**: No built-in analytics for form performance or response rates
8. **No Conditional Logic**: Forms don't support conditional field visibility
9. **Limited Field Types**: No date pickers, rating scales, or matrix questions
10. **No Collaboration**: Single-user forms (no sharing/collaboration features)

### Technical Debt

- No comprehensive error handling for edge cases
- Missing input sanitization in some endpoints
- No automated testing (unit/integration tests)
- No CI/CD pipeline
- Hardcoded configuration values in some components

## 🔮 Future Improvements

### Short-term (1-3 months)

1. **Form Editor**: Allow users to edit existing forms
2. **Real-time Updates**: WebSocket integration for live submission updates
3. **Export Functionality**: Export responses to CSV/Excel
4. **Email Notifications**: Send confirmation emails to form respondents
5. **Form Templates**: Pre-built templates for common use cases
6. **Dark Mode**: Theme toggle for UI

### Medium-term (3-6 months)

1. **Advanced Field Types**:
   - Date/time pickers
   - Rating scales (star ratings, NPS)
   - Matrix/grid questions
   - Signature fields
   - Location/address fields

2. **Conditional Logic**: Show/hide fields based on previous answers
3. **Form Analytics Dashboard**:
   - Response rate tracking
   - Completion time analytics
   - Drop-off analysis
   - Visual charts and graphs

4. **Collaboration Features**:
   - Share forms with team members
   - Role-based permissions (viewer, editor, admin)
   - Comments and annotations

5. **Multi-language Support**: i18n for UI and form generation

### Long-term (6-12 months)

1. **Advanced AI Features**:
   - Auto-suggest form improvements based on response patterns
   - Sentiment analysis on text responses
   - Automatic response categorization
   - Fraud detection for submissions

2. **Integration Ecosystem**:
   - Zapier/Make.com integration
   - Google Sheets sync
   - Slack/Discord notifications
   - CRM integrations (Salesforce, HubSpot)

3. **Enterprise Features**:
   - SSO/SAML authentication
   - Custom branding and white-labeling
   - Advanced security (2FA, audit logs)
   - SLA guarantees and dedicated support

4. **Mobile Apps**: Native iOS/Android apps for form creation and management

5. **Payment Integration**: Collect payments through forms (Stripe/PayPal)

6. **Workflow Automation**: Trigger actions based on form submissions

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Material UI, MongoDB, and Google Gemini AI**
