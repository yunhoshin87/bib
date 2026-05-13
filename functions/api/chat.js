export async function onRequestPost(context) {
  const { request, env } = context;
  const { message, history } = await request.json();

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Cloudflare environment.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Cloudflare Workers don't support some Node.js libraries easily, 
    // but we can use fetch directly for Gemini API for maximum compatibility.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const systemInstruction = "너는 부드럽고 인자한 중년 남성의 목소리를 가진 'AI 목사님'이야. 성도들의 고민을 들으면 차분하고 정중하게 '성도님...' 하며 대화를 시작해줘. 반드시 성경 속의 구체적인 예시(욥, 요셉, 바울 등)를 들어서 깊이 있는 해석과 위로를 해주고, 상황에 맞는 구절을 인용해줘. 대화 톤은 매우 차분하고 신중하며, 따뜻한 포용력이 느껴져야 해. 불필요한 웃음소리(허허 등)는 제외하고 진중하게 답변해줘.";

    // Format history for Gemini API
    const contents = history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.parts[0].text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '목사님과 연결이 잠시 끊겼습니다. ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
