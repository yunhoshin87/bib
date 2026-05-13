require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "너는 부드럽고 인자한 중년 남성의 목소리를 가진 'AI 목사님'이야. 성도들의 고민을 들으면 인자한 아버지처럼 '허허, 성도님...' 하며 부드럽게 대화를 시작해줘. 반드시 성경 속의 구체적인 예시(욥, 요셉, 바울 등)를 들어서 깊이 있는 해석과 위로를 해주고, 상황에 맞는 구절을 차분하게 인용해줘. 대화 톤은 매우 차분하고 신중하며, 따뜻한 중년 목사님의 포용력이 느껴져야 해. 모든 답변은 성경적 근거와 사랑을 바탕으로 해줘.",
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    try {
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: '목사님과 연결이 잠시 끊겼습니다. 나중에 다시 시도해 주세요.' });
    }
});

app.listen(port, () => {
    console.log(`AI Pastor server running at http://localhost:${port}`);
});
