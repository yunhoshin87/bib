export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // [1] AI 상담 API 로직
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message, history } = await request.json();
        const api_key = env.GEMINI_API_KEY;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${api_key}`;
        
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [...(history || []).map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.parts[0].text }] })), { role: 'user', parts: [{ text: message }] }],
            systemInstruction: { parts: [{ text: "너는 부드럽고 인자한 영적 동반자 '진리'야. 성도들의 고민을 들으면 차분하고 정중하게 '성도님...' 하며 대화를 시작해줘. 반드시 성경 속의 구체적인 예시를 들어 위로해주고 성경 구절을 인용해줘." }] }
          })
        });

        const data = await response.json();
        return new Response(JSON.stringify({ response: data.candidates[0].content.parts[0].text }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    // [2] 웹 화면(HTML) 출력
    return new Response(HTML_CONTENT, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

// HTML 내용을 안전하게 삽입하기 위해 백틱(`)과 변수(${...})를 이스케이프 처리했습니다.
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>My Pray - 당신을 위한 기도</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root { --parchment: #fcfaf2; --divine-gold: #c5a059; --deep-charcoal: #2d2d2f; --prayer-brown: #5d4e37; }
        body { font-family: 'Inter', sans-serif; background-color: var(--parchment); color: var(--deep-charcoal); }
        h1, h2, .serif { font-family: 'Bodoni Moda', serif; }
        .glass-header { background: rgba(252, 250, 242, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(197, 160, 89, 0.2); position: sticky; top: 0; z-index: 100; }
        .chat-container { height: calc(100vh - 220px); overflow-y: auto; padding-bottom: 100px; scrollbar-width: none; }
        .message-ai { background: white; border: 1px solid rgba(197, 160, 89, 0.15); border-radius: 20px 20px 20px 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .message-user { background: var(--prayer-brown); color: white; border-radius: 20px 20px 4px 20px; box-shadow: 0 4px 12px rgba(93,78,55,0.15); }
        .input-area { background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border: 1px solid rgba(197,160,89,0.3); border-radius: 30px; }
        .gold-btn { background: var(--divine-gold); color: white; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .welcome-card { background: linear-gradient(135deg, #fff 0%, #f9f6ef 100%); border: 1px solid rgba(197,160,89,0.2); border-radius: 24px; padding: 24px; margin-bottom: 24px; }
    </style>
</head>
<body class="flex justify-center min-h-screen">
    <div class="w-full max-w-2xl flex flex-col px-4 md:px-0">
        <header class="glass-header py-5 flex justify-between items-center px-4 mb-2">
            <div class="flex items-center gap-3"><span class="text-2xl">🕊️</span><div><h1 class="text-xl font-bold">My Pray</h1><p class="text-[10px] uppercase text-[var(--divine-gold)] font-semibold">Divine Wisdom</p></div></div>
            <div class="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full"><div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span class="text-[10px] text-green-600">연결됨</span></div>
        </header>
        <main class="flex-1 flex flex-col">
            <div id="chat-box" class="chat-container space-y-8 py-6 px-2">
                <div class="welcome-card text-center"><h2 class="serif text-2xl mb-3 text-[var(--divine-gold)]">오늘의 묵상</h2><p class="text-sm italic text-gray-600">"너희는 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라" <br>— 요한복음 14:1</p></div>
                <div class="flex justify-start gap-3 items-end"><div class="w-9 h-9 rounded-full bg-[var(--divine-gold)] flex items-center justify-center text-white text-xs shadow-md">진리</div><div class="message-ai p-5 max-w-[85%] text-[15px]">성도님, 평안하셨는지요. 함께 기도하는 마음으로 귀를 기울이겠습니다.</div></div>
            </div>
            <div class="sticky bottom-0 pb-8 pt-4 bg-gradient-to-t from-[var(--parchment)] to-transparent">
                <div class="input-area flex items-center p-2 gap-2 pr-3 mx-2">
                    <button id="mic-btn" class="p-3"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z"></path></svg></button>
                    <input type="text" id="user-input" placeholder="상담 신청하기..." class="flex-1 bg-transparent border-none focus:ring-0 text-[15px] outline-none">
                    <button onclick="sendMessage()" class="gold-btn"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></button>
                </div>
            </div>
        </main>
    </div>
    <script>
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        let history = [];
        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;
            appendMessage('user', message);
            userInput.value = '';
            try {
                const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) });
                const data = await response.json();
                if (data.response) { appendMessage('ai', data.response); history.push({ role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text: data.response }] }); }
            } catch (e) { appendMessage('ai', '오류가 발생했습니다.'); }
        }
        function appendMessage(role, text) {
            const wrapper = document.createElement('div');
            wrapper.className = "flex " + (role === 'user' ? 'justify-end' : 'justify-start') + " gap-3 items-end px-2";
            if (role === 'ai') {
                const avatar = document.createElement('div'); avatar.className = "w-9 h-9 rounded-full bg-[var(--divine-gold)] flex items-center justify-center text-white text-xs"; avatar.innerText = "진리"; wrapper.appendChild(avatar);
            }
            const bubble = document.createElement('div');
            bubble.className = (role === 'user' ? 'message-user' : 'message-ai') + " p-5 max-w-[85%] text-[15px] leading-relaxed whitespace-pre-wrap";
            bubble.innerText = text;
            wrapper.appendChild(bubble);
            chatBox.appendChild(wrapper);
            chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
        }
        userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    </script>
</body>
</html>
`;
