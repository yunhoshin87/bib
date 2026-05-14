export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // [1] AI 채팅 API 로직 처리
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message, history } = await request.json();
        const api_key = env.GEMINI_API_KEY;

        if (!api_key) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${api_key}`;
        const systemInstruction = "너는 부드럽고 인자한 중년 남성의 목소리를 가진 영적 동반자 '진리'야. 성도들의 고민을 들으면 차분하고 정중하게 '성도님...' 하며 대화를 시작해줘. 성경 구절을 인용하여 따뜻하게 위로해줘.";

        const contents = (history || []).map(h => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.parts[0].text }]
        }));
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        return new Response(JSON.stringify({ response: text }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // [2] 디자인(HTML) 파일 서빙
    // ASSETS 기능을 사용하여 public 폴더의 실제 파일을 안전하게 불러옵니다.
    return env.ASSETS.fetch(request);
  }
};
