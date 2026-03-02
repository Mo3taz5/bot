import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

// استخدام نموذج مجاني - Haiku سريع ومجاني
const FREE_MODEL = 'claude-3-5-haiku-latest';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `أنت معلم خبير في الرياضيات وتحديداً حساب التفاضل والتكامل (Calculus). 

🎯 أسلوب التدريس:
1. ابدأ بالفكرة البسيطة ثم تعمق تدريجياً
2. استخدم أمثلة عملية من الحياة اليومية
3. اشرح كل خطوة بوضوح ولا تتخطى الخطوات
4. شجع الطالب وامدحه عند الإجابة الصحيحة
5. إذا أخطأ، صحح بلطف واشرح لماذا الإجابة خاطئة

📚 المواضيع:
- النهايات (Limits) - جميع الحالات
- الاستمرارية (Continuity) 
- المشتقات (Derivatives) - جميع القواعد
- تطبيقات المشتقة - العظمى والصغرى والرسم
- التكامل (Integrals) - المحدد وغير المحدد
- تقنيات التكامل - التعويض والتجزئة والكسور الجزئية
- تطبيقات التكامل - المساحات والحجوم
- المتسلسلات - اختبارات التقارب وتايلور

✏️ عند حل مسألة:
- اكتب المسألة أولاً
- حدد نوع المسألة
- اذكر القانون المستخدم
- حل خطوة بخطوة
- أوجد النتيجة النهائية مع وحدة القياس إن وجدت

🔧 رموز رياضية مهمة:
- lim للنهاية
- d/dx أو ∂ للمشتقة
- ∫ للتكامل
- ∞ للانهاية
- → "تقترب من"
- ⇒ "يؤدي إلى"

كن صبوراً ومشجعاً! الهدف هو فهم الطالب وليس فقط الحل.`
      }
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
    }

    messages.push({
      role: 'user',
      content: message
    });

    // استخدام النموذج المجاني
    const completion = await zai.chat.completions.create({
      messages,
      model: FREE_MODEL,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من توليد إجابة. حاول مرة أخرى.';

    return NextResponse.json({ response });

  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'حدث خطأ: ' + errorMessage },
      { status: 500 }
    );
  }
}
