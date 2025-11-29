import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateFormSchema = async (prompt: string): Promise<any> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = `
    You are an AI that generates JSON schemas for forms based on natural language descriptions.
    Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    
    The JSON schema should follow this structure:
    {
      "title": "Form Title",
      "description": "Form Description",
      "fields": [
        {
          "name": "fieldName",
          "label": "Field Label",
          "type": "text|email|number|textarea|checkbox|select",
          "required": boolean,
          "options": ["option1", "option2"] // Only for select type
        }
      ]
    }
  `;

  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks if the model ignores instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate form schema');
  }
};
