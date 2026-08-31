export async function callGemini(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = options.model || 'gemini-1.5-flash';

  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key tidak ditemukan',
      fallback: true,
      response: generateFallbackResponse(prompt)
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 1024
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return { success: true, response: text, model };
  } catch (error) {
    return { success: false, error: error.message, fallback: true, response: generateFallbackResponse(prompt) };
  }
}

function generateFallbackResponse(prompt) {
  const lower = prompt.toLowerCase();

  if (lower.includes('code') || lower.includes('function') || lower.includes('program')) {
    return `// Fallback response - Gemini API belum dikonfigurasi
// Prompt: ${prompt}

function processTask(input) {
  console.log('Processing:', input);
  return { status: 'fallback_mode', input };
}`;
  }

  if (lower.includes('analyze') || lower.includes('data')) {
    return `Fallback Analysis Response:
- Mode: Offline (Gemini API belum dikonfigurasi)
- Input: ${prompt}
- Status: Menunggu konfigurasi API key`;
  }

  if (lower.includes('write') || lower.includes('content')) {
    return `Fallback Content Response:
Mode offline aktif. Untuk response yang lebih baik, silakan konfigurasi GEMINI_API_KEY di file .env.local`;
  }

  return `Fallback Response untuk: ${prompt}
Mode: Offline (tanpa API key)
Action: Konfigurasi GEMINI_API_KEY untuk response yang lebih baik`;
}

export async function generateCode(task) {
  return callGemini(`Buatkan kode untuk: ${task}. Berikan response dalam format kode yang siap pakai.`, { model: 'gemini-1.5-flash' });
}

export async function analyzeData(data) {
  return callGemini(`Analisis data berikut: ${data}. Berikan insight dan kesimpulan.`, { model: 'gemini-1.5-pro' });
}

export async function generateContent(topic) {
  return callGemini(`Buatkan konten untuk: ${topic}. Tulis dengan baik dan terstruktur.`, { model: 'gemini-1.5-flash' });
}
