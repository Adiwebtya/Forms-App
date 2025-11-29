import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        // 1. Signup/Login
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'password123';

        console.log('Creating user:', email);
        const authRes = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password,
        });

        const token = authRes.data.token;
        console.log('Got token:', token);

        // 2. Generate Form
        const prompt = 'Create a feedback form with name, email, rating, and comments';
        console.log('Generating form with prompt:', prompt);

        const formRes = await axios.post(
            `${API_URL}/forms/generate`,
            { prompt },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Form generated successfully!');
        console.log('Form Title:', formRes.data.title);
        console.log('Form Fields:', JSON.stringify(formRes.data.content.fields, null, 2));

    } catch (error: any) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
};

runTest();
