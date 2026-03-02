import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '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';
const MODEL = 'glm-4/glm-4.5-air:free';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemMessage = {
      role: 'system',
      content: `أنت معلم خبير في الرياضيات وحساب التفاضل والتكامل (Calculus).

🎯 أسلوب التدريس:
- ابدأ بالفكرة البسيطة ثم تعمق
- استخدم أمثلة عملية
- اشرح كل خطوة بوضوح

📐 قواعد تنسيق المعادلات (مهم جداً!):

1. المعادلات الكبيرة استخدم:
   $$معادلة$$
   
2. المعادلات الصغيرة ضمن النص استخدم:
   $معادلة$

3. أمثلة على التنسيق:
   - كسر: $$\\frac{البسط}{المقام}$$
   - أس: $x^2$ أو $$x^{n+1}$$
   - تكامل: $$\\int x^2 \\, dx$$
   - نهاية: $$\\lim_{x \\to a} f(x)$$
   - جمع: $$\\sum_{i=1}^{n} x_i$$

4. مثال كامل لحل مسألة:

**المسألة:** أوجد $$\\int x^2 \\, dx$$

**الحل:**
نستخدم قاعدة التكامل:
$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$$

بالتعويض $n=2$:
$$= \\frac{x^{2+1}}{2+1} + C$$

$$= \\frac{x^3}{3} + C$$

✅ استخدم LaTeX دائماً للمعادلات!
✅ كل معادلة كبيرة في سطر منفصل باستخدام $$
✅ المعادلات الصغيرة ضمن النص باستخدام $`
    };

    const chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          chatHistory.push({ role: msg.role, content: msg.content });
        }
      }
    }
    chatHistory.push({ role: 'user', content: message });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
        'HTTP-Referer': 'https://calculus-arabic-tutor.app',
        'X-Title': 'Calculus Arabic Tutor'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [systemMessage].concat(chatHistory),
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return NextResponse.json({ error: 'خطأ في الاتصال: ' + error }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.';

    return NextResponse.json({ response: content });

  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'حدث خطأ: ' + (error instanceof Error ? error.message : 'خطأ غير معروف') }, { status: 500 });
  }
}
