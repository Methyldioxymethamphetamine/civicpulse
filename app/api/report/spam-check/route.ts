import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description, category } = await req.json();

    const prompt = `Analyze this civic infrastructure report. Category: "${category}". Description: "${description}". Is this real or likely spam/fake/gibberish? Answer with exactly one word: "REAL" or "SPAM".`;

    const apiKey1 = process.env.GEMINI_API_KEY1;
    const apiKey2 = process.env.GEMINI_API_KEY2;

    const callGemini = async (key: string) => {
      // Using gemini-2.0-flash which is widely available and fast
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
        })
      });
      if (!res.ok) {
         throw new Error(`Gemini API error: ${res.status}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toUpperCase() || 'REAL';
      return text.includes('SPAM');
    };

    let isSpam = false;
    try {
      if (apiKey1) {
        isSpam = await callGemini(apiKey1);
      } else {
         isSpam = false;
      }
    } catch (e) {
      console.error('Gemini API 1 failed, trying fallback', e);
      if (apiKey2) {
        isSpam = await callGemini(apiKey2);
      }
    }

    return NextResponse.json({ isSpam });
  } catch (err) {
    console.error('Spam check failed:', err);
    return NextResponse.json({ isSpam: false }); // fallback to false
  }
}
