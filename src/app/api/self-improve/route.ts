import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FREE_MODEL = 'claude-3-5-haiku-latest';
const LOG_FILE = '/home/z/my-project/server-health.log';

interface HealthMetric {
  timestamp: string;
  type: 'error' | 'warning' | 'info' | 'improvement';
  message: string;
  suggestion?: string;
}

// قراءة سجل الصحة
function readHealthLog(): HealthMetric[] {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

// كتابة إلى السجل
function writeHealthLog(metrics: HealthMetric[]) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(metrics, null, 2));
  } catch {
    // ignore
  }
}

// إضافة سجل جديد
function logMetric(type: HealthMetric['type'], message: string, suggestion?: string) {
  const metrics = readHealthLog();
  metrics.push({
    timestamp: new Date().toISOString(),
    type,
    message,
    suggestion
  });
  // الاحتفاظ بآخر 100 سجل فقط
  if (metrics.length > 100) {
    metrics.shift();
  }
  writeHealthLog(metrics);
}

export async function GET() {
  try {
    const metrics = readHealthLog();
    const errors = metrics.filter(m => m.type === 'error').length;
    const warnings = metrics.filter(m => m.type === 'warning').length;
    const improvements = metrics.filter(m => m.type === 'improvement').length;

    return NextResponse.json({
      status: 'healthy',
      stats: {
        totalLogs: metrics.length,
        errors,
        warnings,
        improvements
      },
      recentLogs: metrics.slice(-10)
    });
  } catch (error: unknown) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, code, error, context } = await request.json();

    const zai = await ZAI.create();

    let prompt = '';
    let systemPrompt = '';

    switch (action) {
      case 'analyze-error':
        systemPrompt = `أنت خبير في تحليل أخطاء السيرفر وتحسين الأداء.
تحليل الأخطاء واقتراح حلول عملية.
الرد يجب أن يكون بتنسيق JSON:
{
  "severity": "high|medium|low",
  "cause": "سبب الخطأ",
  "solution": "الحل المقترح",
  "codeFix": "الكود المصحح إن أمكن"
}`;
        prompt = `تحليل هذا الخطأ:
الخطأ: ${error}
السياق: ${context || 'غير متوفر'}

قدم تحليلاً وحلاً.`;
        break;

      case 'improve-code':
        systemPrompt = `أنت خبير في تحسين كود Next.js و TypeScript.
تحسين الكود مع الحفاظ على الوظيفة.
الرد بتنسيق JSON:
{
  "improvements": ["تحسين 1", "تحسين 2"],
  "optimizedCode": "الكود المحسن",
  "performance": "تحسين الأداء المتوقع"
}`;
        prompt = `حسّن هذا الكود:
\`\`\`typescript
${code}
\`\`\`

قدم كوداً محسناً مع شرح التحسينات.`;
        break;

      case 'health-check':
        systemPrompt = `أنت خبير في مراقبة صحة السيرفر.
تحليل الوضع واقتراح تحسينات.
الرد بتنسيق JSON:
{
  "status": "healthy|warning|critical",
  "analysis": "التحليل",
  "recommendations": ["توصية 1", "توصية 2"]
}`;
        prompt = `تحليل صحة السيرفر:
السجلات الأخيرة: ${JSON.stringify(readHealthLog().slice(-5))}
الوقت: ${new Date().toISOString()}

قدم تحليلاً وتوصيات.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: FREE_MODEL,
      temperature: 0.3,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || '{}';

    // تسجيل التحسين
    logMetric('improvement', `AI Analysis: ${action}`, response);

    // محاولة parsing الـ JSON
    let parsedResponse;
    try {
      // إزالة علامات ```json إن وجدت
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      parsedResponse = JSON.parse(cleanResponse);
    } catch {
      parsedResponse = { raw: response };
    }

    return NextResponse.json({
      success: true,
      action,
      result: parsedResponse
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logMetric('error', errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
