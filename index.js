export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // [1] AI API 처리
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
            systemInstruction: { parts: [{ text: "너는 부드럽고 인자한 영적 동반자 '진리'야. 성경 구절을 인용해 따뜻하게 위로해줘." }] }
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

    // [2] 디자인 파일 서빙 (안전한 에셋 방식)
    return env.ASSETS.fetch(request);
  }
};
