require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let bibleVerses = [];
try {
    const bibleContent = fs.readFileSync(path.join(__dirname, 'bible.md'), 'utf-8');
    bibleVerses = bibleContent.split('\n').filter(line => line.match(/^\d+\./));
} catch (e) {}

function findRelevantVerses(query, count = 3) {
    const keywords = query.split(' ').filter(k => k.length > 1);
    if (keywords.length === 0 || bibleVerses.length === 0) return '';
    const matches = bibleVerses.filter(verse => 
        keywords.some(kw => verse.includes(kw))
    );
    return matches.slice(0, count).join('\n');
}

// Using gemini-flash-latest for best compatibility with current quota
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const SYSTEM_PROMPT = "너는 부드럽고 인자한 중년 남성의 목소리를 가진 'AI 목사님'이야. 성도들의 고민을 들으면 차분하고 정중하게 '성도님...' 하며 대화를 시작해줘. 반드시 성경 속의 구체적인 예시(욥, 요셉, 바울 등)를 들어서 깊이 있는 해석과 위로를 해주고, 상황에 맞는 구절을 인용해줘. 대화 톤은 매우 차분하고 신중하며, 따뜻한 포용력이 느껴져야 해. 불필요한 웃음소리(허허 등)는 제외하고 진중하게 답변해줘.";

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
        const relevantVerses = findRelevantVerses(message);
        const augmentedMessage = relevantVerses 
            ? `성도님의 고민과 관련된 성경 말씀입니다:\n${relevantVerses}\n\n성도님의 말씀: ${message}`
            : message;

        const chat = model.startChat({ history: history || [] });
        const prompt = (history && history.length > 0) ? augmentedMessage : `${SYSTEM_PROMPT}\n\n${augmentedMessage}`;
        const result = await chat.sendMessage(prompt);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '목사님과 연결이 고르지 못합니다. 잠시 후 다시 시도해 주세요.' });
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
