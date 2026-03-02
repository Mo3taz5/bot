import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API - GLM 4.5 Air
const API_KEY = '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';
const MODEL = 'glm-4/glm-4.5-air:free';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // بناء رسالة النظام
    const systemMessage = {
      role: 'system',
      content: `أنت معلم خبير في الرياضيات وتحديداً حساب التفاضل والتكامل (Calculus).

🎯 أسلوب التدريس:
1. ابدأ بالفكرة البسيطة ثم تعمق تدريجياً
2. استخدم أمثلة عملية من الحياة اليومية
3. اشرح كل خطوة بوضوح ولا تتخطى الخطوات
4. استخدم تنسيق LaTeX للمعادلات الرياضية

📐 تنسيق المعادلات:
- استخدم $$ للمعادلات الكبيرة (في سطر منفصل)
- استخدم $ للمعادلات الصغيرة (ضمن النص)
- كل معادلة كبيرة يجب أن تكون في سطر منفصل

✏️ عند حل مسألة:
- اكتب المسألة أولاً
- حدد نوع المسألة
- اذكر القانون المستخدم بصيغة LaTeX
- حل خطوة بخطوة
- أوجد النتيجة النهائية

مثال على التنسيق:
**المسألة:** أوجد $$\\int x^2 \\, dx$$

**الحل:**
نستخدم قاعدة التكامل:
$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$$

بالتعويض:
$$= \\frac{x^{2+1}}{2+1} + C = \\frac{x^3}{3} + C$$

كن صبوراً ومشجعاً! استخدم LaTeX دائماً للمعادلات.`
    };

    // بناء محفوظة المحادثة
    const chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          chatHistory.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
    }

    // إضافة رسالة المستخدم الحالية
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
      return NextResponse.json({ 
        error: 'خطأ في الاتصال: ' + error 
      }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من توليد إجابة.';

    return NextResponse.json({ response: content });

  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'حدث خطأ: ' + errorMessage },
      { status: 500 }
    );
  }
}
