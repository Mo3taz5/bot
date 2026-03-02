'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

const renderMath = (text: string): string => {
  let r = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => '<div class="eq">'+formatEq(m.trim())+'</div>')
  r = r.replace(/\$([^$\n]+?)\$/g, (_, m) => '<span class="eqi">'+formatEq(m.trim())+'</span>')
  return r
}

const formatEq = (s: string): string => s
  .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="fr"><span class="fn">$1</span><span class="fd">$2</span></span>')
  .replace(/\^(\d+)/g, '<sup>$1</sup>').replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
  .replace(/_(\d)/g, '<sub>$1</sub>').replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
  .replace(/\\int/g, '∫').replace(/\\sum/g, '∑').replace(/\\lim/g, 'lim')
  .replace(/\\infty/g, '∞').replace(/\\to/g, '→').replace(/\\rightarrow/g, '→')
  .replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\div/g, '÷')
  .replace(/\\pm/g, '±').replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
  .replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan')
  .replace(/\\ln/g, 'ln').replace(/\\log/g, 'log').replace(/\\pi/g, 'π')
  .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥').replace(/\\neq/g, '≠')
  .replace(/\\approx/g, '≈').replace(/\\quad/g, '  ').replace(/\\,/g, ' ')
  .replace(/\\text\{([^}]+)\}/g, '$1').replace(/{/g, '').replace(/}/g, '')

export default function Page() {
  const [page, setPage] = useState('home')
  const [chat, setChat] = useState(false)
  const [msgs, setMsgs] = useState<Message[]>([{role:'assistant',content:'مرحباً! اسألني عن أي مفهوم! 🧮'}])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.scrollIntoView({behavior:'smooth'}) }, [msgs])

  const go = (p: string) => { setPage(p); window.scrollTo({top:0,behavior:'smooth'}) }

  const send = async () => {
    if (!input.trim() || typing) return
    const q = input.trim()
    setInput('')
    setMsgs(m => [...m, {role:'user',content:q}])
    setTyping(true)
    try {
      const r = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:q, history:msgs.slice(-6)})})
      const d = await r.json()
      setMsgs(m => [...m, {role:'assistant',content:d.response||d.error}])
    } catch { setMsgs(m => [...m, {role:'assistant',content:'خطأ!'}]) }
    setTyping(false)
  }

  return <>
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Amiri:wght@700&display=swap');
      :root{--bg:#0a0f1a;--s1:#111827;--s2:#1f2937;--bl:#38bdf8;--pu:#a78bfa;--pk:#f472b6;--go:#fbbf24;--gr:#34d399;--re:#f87171;--cy:#22d3ee;--tx:#f1f5f9;--mt:#94a3b8;--bd:rgba(56,189,248,0.15)}
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:var(--bg);color:var(--tx);font-family:'Cairo',sans-serif;min-height:100vh;line-height:1.8}
      body::before{content:'';position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 15% 5%,rgba(56,189,248,0.07),transparent 50%),radial-gradient(ellipse at 85% 95%,rgba(167,139,250,0.05),transparent 50%)}
      
      .eq{display:block;background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(167,139,250,0.08));border:1px solid rgba(56,189,248,0.25);border-radius:14px;padding:18px 26px;margin:16px 0;font-family:'Times New Roman','Amiri',serif;font-size:1.3em;text-align:center;direction:ltr;color:var(--bl)}
      .eqi{display:inline;background:rgba(56,189,248,0.12);padding:2px 8px;border-radius:6px;font-family:'Times New Roman',serif;font-size:1.1em;direction:ltr;color:var(--cy)}
      .fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px}
      .fn{border-bottom:2px solid var(--bl);padding:0 6px}
      .fd{padding:0 6px}
      sup,sub{font-size:0.65em}
      
      header{text-align:center;padding:60px 24px 40px;border-bottom:1px solid var(--bd)}
      .bdg{display:inline-flex;gap:8px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:var(--bl);padding:6px 18px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:18px}
      header h1{font-family:'Amiri',serif;font-size:clamp(28px,5vw,60px);background:linear-gradient(135deg,#38bdf8,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px}
      header p{color:var(--mt);font-size:16px;max-width:500px;margin:0 auto}
      
      nav{position:sticky;top:0;z-index:200;background:rgba(10,15,26,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--bd)}
      .nv{display:flex;max-width:1180px;margin:0 auto;overflow-x:auto;scrollbar-width:none}
      .nb{padding:12px 14px;color:var(--mt);background:none;border:none;border-bottom:2px solid transparent;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}
      .nb:hover{color:var(--bl)}
      .nb.on{color:var(--bl);border-color:var(--bl)}
      
      main{max-width:1000px;margin:0 auto;padding:40px 20px 120px}
      .pg{display:none;animation:fi .3s}
      .pg.on{display:block}
      @keyframes fi{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      
      .pt{font-family:'Amiri',serif;font-size:clamp(24px,3.5vw,40px);font-weight:700;margin-bottom:6px}
      .pt .hl{background:linear-gradient(120deg,var(--bl),var(--pu));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .ps{color:var(--mt);font-size:14px;margin-bottom:30px}
      
      .bx{background:var(--s1);border:1px solid var(--bd);border-radius:18px;padding:28px;margin-bottom:24px;position:relative}
      .bx::before{content:'';position:absolute;top:0;right:0;width:4px;height:100%;background:linear-gradient(180deg,var(--bl),var(--pu));border-radius:4px}
      .hd{display:flex;align-items:center;gap:14px;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--bd)}
      .nm{background:linear-gradient(135deg,var(--bl),var(--pu));color:#000;width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px}
      .bx h2{font-size:20px;font-weight:700}
      .bx h3{font-size:15px;font-weight:700;margin:20px 0 12px;color:var(--tx);padding-bottom:8px;border-bottom:1px solid var(--bd)}
      
      .cn{background:var(--s2);border-radius:12px;padding:16px 20px;margin:14px 0;border-right:4px solid var(--bl)}
      .cn.g{border-right-color:var(--go)}.cn.p{border-right-color:var(--pk)}.cn.pu{border-right-color:var(--pu)}.cn.gr{border-right-color:var(--gr')}
      .cn h4{font-size:13px;font-weight:700;margin-bottom:8px;color:var(--bl)}
      .cn.g h4{color:var(--go'}.cn.p h4{color:var(--pk'}.cn.pu h4{color:var(--pu'}.cn.gr h4{color:var(--gr'}
      .cn p,.cn li{color:var(--mt);font-size:13px;line-height:1.9}
      .cn ul{padding-right:20px}
      
      .ex{background:rgba(52,211,153,0.05);border:1px solid rgba(52,211,153,0.2);border-radius:12px;padding:18px;margin:14px 0}
      .el{font-size:10px;font-weight:700;color:var(--gr);letter-spacing:2px;margin-bottom:10px}
      .ex p{color:var(--mt);font-size:13px;line-height:1.9}
      
      .stps{margin:12px 0}
      .stp{display:flex;gap:12px;margin-bottom:10px;align-items:flex-start}
      .snm{background:rgba(56,189,248,0.15);color:var(--bl);width:28px;height:28px;min-width:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
      .stp p{color:var(--mt);font-size:13px;line-height:1.8}
      .stp strong{color:var(--tx)}
      
      .cs{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin:18px 0}
      .c{background:var(--s2);border:1px solid var(--bd);border-radius:14px;padding:16px}
      .ch{display:flex;align-items:center;gap:10px;margin-bottom:10px}
      .bg{padding:4px 12px;border-radius:999px;font-size:10px;font-weight:700}
      .c h4{font-size:14px;font-weight:700}
      .c p{color:var(--mt);font-size:12px;margin-top:6px}
      
      .hg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin:24px 0}
      .hc{background:var(--s1);border:1px solid var(--bd);border-radius:16px;padding:22px;cursor:pointer;transition:all .3s}
      .hc:hover{transform:translateY(-4px);border-color:var(--bl);box-shadow:0 16px 40px rgba(0,0,0,0.4)}
      .hi{font-size:36px;margin-bottom:10px}
      .hc h3{font-size:16px;font-weight:700;margin-bottom:4px}
      .hc p{color:var(--mt);font-size:12px}
      
      .nt{border-radius:10px;padding:14px 18px;margin:16px 0;display:flex;gap:10px}
      .nt.i{background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2)}
      .ni{font-size:16px}
      .nt p{color:var(--mt);font-size:13px}
      .nt strong{color:var(--bl)}
      
      /* Chat */
      #fab{position:fixed;bottom:24px;left:24px;width:58px;height:58px;border-radius:50%;border:none;background:linear-gradient(135deg,#38bdf8,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:9999;box-shadow:0 6px 24px rgba(56,189,248,0.4)}
      #fab:hover{transform:scale(1.08)}
      #cb{position:fixed;bottom:96px;left:18px;width:380px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#0f172a;border:1px solid var(--bd);border-radius:20px;display:flex;flex-direction:column;z-index:9998;box-shadow:0 24px 60px rgba(0,0,0,0.5);transform:scale(.85) translateY(20px);opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.34,1.56,.64,1);transform-origin:bottom left}
      #cb.on{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
      #ch{background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(167,139,250,0.1));padding:12px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between}
      #ca{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:17px}
      #cs{font-size:10px;color:var(--gr');margin-top:2px}
      #cs.b{color:var(--go);animation:bl 1s infinite}
      @keyframes bl{0%,100%{opacity:1}50%{opacity:.3}}
      #cx{background:rgba(255,255,255,0.05);border:none;color:var(--mt);width:28px;height:28px;border-radius:7px;cursor:pointer;font-size:14px}
      #cm{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px}
      .m{display:flex;gap:8px;animation:mi .25s}
      @keyframes mi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      .m.u{flex-direction:row-reverse}
      .ma{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#38bdf8,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:14px}
      .m.u .ma{background:linear-gradient(135deg,#f472b6,#fbbf24)}
      .mb{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;font-size:12px;line-height:1.8;max-width:280px;word-break:break-word;white-space:pre-wrap}
      .m.u .mb{background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(167,139,250,0.1));border-color:rgba(56,189,248,0.2);text-align:right}
      .td{display:flex;gap:3px;padding:10px}
      .td div{width:5px;height:5px;border-radius:50%;background:var(--bl);animation:tb 1s infinite}
      .td div:nth-child(2){animation-delay:.15s}
      .td div:nth-child(3){animation-delay:.3s}
      @keyframes tb{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}
      #csu{display:flex;gap:5px;padding:6px 12px;overflow-x:auto;scrollbar-width:none}
      .sb{background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);color:var(--mt);padding:4px 10px;border-radius:999px;font-family:'Cairo',sans-serif;font-size:10px;cursor:pointer;white-space:nowrap}
      .sb:hover{background:rgba(56,189,248,0.15);color:var(--bl)}
      #ci{padding:8px 12px 12px;border-top:1px solid var(--bd);background:rgba(0,0,0,0.2)}
      #cr{display:flex;gap:8px;align-items:flex-end}
      #ct{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(56,189,248,0.2);border-radius:10px;color:var(--tx);font-family:'Cairo',sans-serif;font-size:12px;padding:8px 12px;resize:none;outline:none;max-height:80px;direction:rtl}
      #ct:focus{border-color:var(--bl)}
      #ct::placeholder{color:#475569}
      #csd{background:linear-gradient(135deg,#38bdf8,#a78bfa);border:none;color:#000;width:40px;height:40px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}
      #csd:hover{transform:scale(1.05)}
      #csd:disabled{opacity:.3;cursor:not-allowed;transform:none}
      
      @media(max-width:640px){.bx{padding:22px 16px}.cs{grid-template-columns:1fr}#cb{bottom:88px;left:6px;right:6px;width:auto}#fab{bottom:16px;left:16px;width:52px;height:52px}}
    `}</style>

    <header>
      <div className="bdg">📚 موسوعة كالكولوس</div>
      <h1>حساب التفاضل والتكامل</h1>
      <p>الشرح الأشمل بالعربية</p>
    </header>

    <nav><div className="nv">
      {[
        {id:'home',l:'🏠 البداية'},{id:'p1',l:'📐 النهايات'},{id:'p2',l:'〰️ الاستمرارية'},
        {id:'p3',l:'📈 المشتقات'},{id:'p4',l:'🎯 تطبيقات'},{id:'p5',l:'∫ التكامل'},
        {id:'p6',l:'🔧 التقنيات'},{id:'p7',l:'📏 تطبيقات تكامل'},{id:'p8',l:'∑ المتسلسلات'},{id:'p9',l:'📋 مراجعة'}
      ].map(i=><button key={i.id} className={'nb '+(page===i.id?'on':'')} onClick={()=>go(i.id)}>{i.l}</button>)}
    </div></nav>

    <main>
      {/* HOME */}
      <div id="home" className={'pg '+(page==='home'?'on':'')}>
        <div className="pt">مرحباً! <span className="hl">ابدأ رحلتك 🚀</span></div>
        <div className="ps">اختر باباً للبدء</div>
        <div className="hg">
          <div className="hc" onClick={()=>go('p1')}><span className="hi">📐</span><h3 style={{color:'var(--bl)'}}>النهايات</h3><p>لوبيتال والحصار</p></div>
          <div className="hc" onClick={()=>go('p2')}><span className="hi">〰️</span><h3 style={{color:'var(--cy)'}}>الاستمرارية</h3><p>أنواع الانقطاع</p></div>
          <div className="hc" onClick={()=>go('p3')}><span className="hi">📈</span><h3 style={{color:'var(--pu)'}}>المشتقات</h3><p>كل القواعد</p></div>
          <div className="hc" onClick={()=>go('p4')}><span className="hi">🎯</span><h3 style={{color:'var(--pk)'}}>تطبيقات</h3><p>العظمى والصغرى</p></div>
          <div className="hc" onClick={()=>go('p5')}><span className="hi">∫</span><h3 style={{color:'var(--go)'}}>التكامل</h3><p>الأساسيات</p></div>
          <div className="hc" onClick={()=>go('p6')}><span className="hi">🔧</span><h3 style={{color:'var(--gr)'}}>التقنيات</h3><p>التعويض والتجزئة</p></div>
          <div className="hc" onClick={()=>go('p7')}><span className="hi">📏</span><h3 style={{color:'var(--bl)'}}>تطبيقات تكامل</h3><p>المساحات والحجوم</p></div>
          <div className="hc" onClick={()=>go('p8')}><span className="hi">∑</span><h3 style={{color:'var(--pu)'}}>المتسلسلات</h3><p>تايلور وماكلورين</p></div>
        </div>
        <div className="nt i"><div className="ni">🤖</div><p><strong>مساعد ذكي:</strong> اضغط الزر الأزرق!</p></div>
      </div>

      {/* P1: LIMITS */}
      <div id="p1" className={'pg '+(page==='p1'?'on':'')}>
        <div className="pt">📐 <span className="hl">النهايات</span></div>
        <div className="ps">كل حالات النهايات</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>مفهوم النهاية</h2></div>
          <div className="eq">{String.raw`$$\lim_{x \to a} f(x) = L$$`}</div>
          <h3>الحالات الستة</h3>
          <div className="cs">
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(52,211,153,0.2)',color:'var(--gr)'}}>1</span><h4>التعويض المباشر</h4></div><p>عوّض مباشرة</p><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\lim_{x \to 3} (x^2+1) = 10$$`}</div></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(251,191,36,0.2)',color:'var(--go)'}}>2</span><h4>0/0</h4></div><p>حلّل أو لوبيتال</p><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\lim_{x \to 2} \frac{x^2-4}{x-2} = 4$$`}</div></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(248,113,113,0.2)',color:'var(--re)'}}>3</span><h4>∞/∞</h4></div><p>اقسم على أعلى قوة</p><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\lim_{x \to \infty} \frac{3x^2}{x^2} = 3$$`}</div></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(167,139,250,0.2)',color:'var(--pu)'}}>4</span><h4>نهايات لانهائية</h4></div><p>{String.raw`$x \to \pm\infty$`}</p><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\lim_{x \to \infty} \frac{1}{x} = 0$$`}</div></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(56,189,248,0.2)',color:'var(--bl)'}}>5</span><h4>الحدود الجانبية</h4></div><p>الجانبيان متساويان</p><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\lim_{x \to a^+} = \lim_{x \to a^-}$$`}</div></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(244,114,182,0.2)',color:'var(--pk)'}}>6</span><h4>0·∞ أو ∞-∞</h4></div><p>حوّل لـ 0/0</p><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$0 \cdot \infty \to \frac{f}{1/g}$$`}</div></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>قاعدة لوبيتال</h2></div>
          <div className="cn g"><h4>⚠️ شروط</h4><ul><li>الشكل بالضبط 0/0 أو ∞/∞</li><li>تُشتق البسط والمقام منفصلين</li></ul></div>
          <div className="eq">{String.raw`$$\lim \frac{f}{g} \Rightarrow \lim \frac{f'}{g'}$$`}</div>
        </div>
      </div>

      {/* P2: CONTINUITY */}
      <div id="p2" className={'pg '+(page==='p2'?'on':'')}>
        <div className="pt">〰️ <span className="hl">الاستمرارية</span></div>
        <div className="ps">متى الدالة متصلة؟</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>تعريف الاستمرارية</h2></div>
          <div className="cn"><h4>✅ الشروط الثلاثة</h4><ul><li>{String.raw`$f(a)$ موجودة`}</li><li>{String.raw`$\lim_{x \to a} f(x)$ موجودة`}</li><li>{String.raw`$\lim_{x \to a} f(x) = f(a)$`}</li></ul></div>
          <div className="eq">{String.raw`$$f \text{ متصلة عند } a \Leftrightarrow \lim_{x \to a} f(x) = f(a)$$`}</div>
          <h3>أنواع الانقطاع</h3>
          <div className="cs">
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(52,211,153,0.2)',color:'var(--gr)'}}>1</span><h4>قابل للإزالة</h4></div><p>النهاية موجودة لكن f(a) مختلفة</p></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(251,191,36,0.2)',color:'var(--go)'}}>2</span><h4>قفزي</h4></div><p>الجانبيان مختلفان</p></div>
            <div className="c"><div className="ch"><span className="bg" style={{background:'rgba(248,113,113,0.2)',color:'var(--re)'}}>3</span><h4>لانهائي</h4></div><p>النهاية = ±∞</p></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>مبرهنة القيمة الوسطية (IVT)</h2></div>
          <div className="eq">{String.raw`$$f(a) < k < f(b) \Rightarrow \exists c : f(c) = k$$`}</div>
          <p style={{color:'var(--mt)',marginTop:'10px'}}>إذا كانت f متصلة على [a,b] و k بين f(a) و f(b)، فتوجد نقطة c حيث f(c)=k</p>
        </div>
      </div>

      {/* P3: DERIVATIVES */}
      <div id="p3" className={'pg '+(page==='p3'?'on':'')}>
        <div className="pt">📈 <span className="hl">المشتقات</span></div>
        <div className="ps">كل قواعد الاشتقاق</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>التعريف</h2></div>
          <div className="eq">{String.raw`$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$`}</div>
          <h3>القواعد الأساسية</h3>
          <div className="cs">
            <div className="c"><h4>قاعدة القوة</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\frac{d}{dx} x^n = nx^{n-1}$$`}</div></div>
            <div className="c"><h4>قاعدة السلسلة</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\frac{d}{dx} f(g) = f'(g) \cdot g'$$`}</div></div>
            <div className="c"><h4>قاعدة الضرب</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$(fg)' = f'g + fg'$$`}</div></div>
            <div className="c"><h4>قاعدة القسمة</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$(f/g)' = \frac{f'g - fg'}{g^2}$$`}</div></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>المشتقات الخاصة</h2></div>
          <div className="cs">
            <div className="c"><p>{String.raw`$(\sin x)' = \cos x$`}</p></div>
            <div className="c"><p>{String.raw`$(\cos x)' = -\sin x$`}</p></div>
            <div className="c"><p>{String.raw`$(e^x)' = e^x$`}</p></div>
            <div className="c"><p>{String.raw`$(\ln x)' = \frac{1}{x}$`}</p></div>
          </div>
        </div>
      </div>

      {/* P4: DERIVATIVE APPLICATIONS */}
      <div id="p4" className={'pg '+(page==='p4'?'on':'')}>
        <div className="pt">🎯 <span className="hl">تطبيقات المشتقة</span></div>
        <div className="ps">العظمى والصغرى ورسم الدوال</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>العظمى والصغرى</h2></div>
          <div className="cn"><h4>📌 خطوات</h4><ul><li>أوجد {String.raw`$f'(x)$`}</li><li>حل {String.raw`$f'(x) = 0$`}</li><li>اختبر النقاط الحرجة</li></ul></div>
          <div className="cs">
            <div className="c"><h4>اختبار المشتقة الأولى</h4><p>{String.raw`$f' > 0$`} تزايد | {String.raw`$f' < 0$`} تناقص</p></div>
            <div className="c"><h4>اختبار المشتقة الثانية</h4><p>{String.raw`$f'' > 0$`} صغرى | {String.raw`$f'' < 0$`} عظمى</p></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>خط المماس</h2></div>
          <div className="eq">{String.raw`$$y - f(a) = f'(a)(x - a)$$`}</div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">3</div><h2>مبرهنة القيمة الوسطية (MVT)</h2></div>
          <div className="eq">{String.raw`$$\exists c : f'(c) = \frac{f(b)-f(a)}{b-a}$$`}</div>
        </div>
      </div>

      {/* P5: INTEGRALS */}
      <div id="p5" className={'pg '+(page==='p5'?'on':'')}>
        <div className="pt">∫ <span className="hl">التكامل</span></div>
        <div className="ps">الأساسيات</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>التكامل الأساسي</h2></div>
          <div className="eq">{String.raw`$$\int f(x) dx = F(x) + C$$`}</div>
          <h3>التكاملات الأساسية</h3>
          <div className="cs">
            <div className="c"><h4>قاعدة القوة</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\int x^n dx = \frac{x^{n+1}}{n+1} + C$$`}</div></div>
            <div className="c"><h4>اللوغاريتم</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\int \frac{1}{x} dx = \ln|x| + C$$`}</div></div>
            <div className="c"><h4>الأسي</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\int e^x dx = e^x + C$$`}</div></div>
            <div className="c"><h4>الجيب</h4><div className="eq" style={{fontSize:'1.1em',padding:'12px'}}>{String.raw`$$\int \sin x dx = -\cos x + C$$`}</div></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>المبرهنة الأساسية</h2></div>
          <div className="eq">{String.raw`$$\int_a^b f(x) dx = F(b) - F(a)$$`}</div>
        </div>
      </div>

      {/* P6: INTEGRATION TECHNIQUES */}
      <div id="p6" className={'pg '+(page==='p6'?'on':'')}>
        <div className="pt">🔧 <span className="hl">تقنيات التكامل</span></div>
        <div className="ps">التعويض والتجزئة والكسور</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>التعويض</h2></div>
          <div className="eq">{String.raw`$$u = g(x) \Rightarrow \int f(g(x))g'(x)dx = \int f(u)du$$`}</div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>التكامل بالتجزئة</h2></div>
          <div className="eq">{String.raw`$$\int u dv = uv - \int v du$$`}</div>
          <div className="cn pu"><h4>💡 متى نستخدمه؟</h4><p>عندما يكون التكامل حاصل ضرب: {String.raw`$x \cdot e^x$`}, {String.raw`$x \cdot \sin x$`}, {String.raw`$\ln x$`}</p></div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">3</div><h2>الكسور الجزئية</h2></div>
          <div className="eq">{String.raw`$$\frac{P(x)}{Q(x)} = \frac{A}{ax+b} + \frac{B}{(ax+b)^2} + ...$$`}</div>
        </div>
      </div>

      {/* P7: INTEGRATION APPLICATIONS */}
      <div id="p7" className={'pg '+(page==='p7'?'on':'')}>
        <div className="pt">📏 <span className="hl">تطبيقات التكامل</span></div>
        <div className="ps">المساحات والحجوم</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>المساحة بين منحنيين</h2></div>
          <div className="eq">{String.raw`$$A = \int_a^b [f(x) - g(x)] dx$$`}</div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>حجم الدوران</h2></div>
          <h3>طريقة القرص</h3>
          <div className="eq">{String.raw`$$V = \pi \int_a^b [f(x)]^2 dx$$`}</div>
          <h3>طريقة القشرة</h3>
          <div className="eq">{String.raw`$$V = 2\pi \int_a^b x \cdot f(x) dx$$`}</div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">3</div><h2>طول القوس</h2></div>
          <div className="eq">{String.raw`$$L = \int_a^b \sqrt{1 + [f'(x)]^2} dx$$`}</div>
        </div>
      </div>

      {/* P8: SERIES */}
      <div id="p8" className={'pg '+(page==='p8'?'on':'')}>
        <div className="pt">∑ <span className="hl">المتسلسلات</span></div>
        <div className="ps">التقارب وتايلور</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>اختبارات التقارب</h2></div>
          <div className="cs">
            <div className="c"><h4>النسبة</h4><p>{String.raw`$\lim |a_{n+1}/a_n| < 1$`} متقاربة</p></div>
            <div className="c"><h4>الجذر</h4><p>{String.raw`$\lim \sqrt[n]{|a_n|} < 1$`} متقاربة</p></div>
            <div className="c"><h4>المقارنة</h4><p>قارن بمتسلسلة معروفة</p></div>
            <div className="c"><h4>التكامل</h4><p>حوّل لتكامل</p></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>متسلسلة تايلور</h2></div>
          <div className="eq">{String.raw`$$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n$$`}</div>
          <h3>متسلسلات مهمة</h3>
          <div className="cs">
            <div className="c"><h4>{String.raw`$e^x$`}</h4><div className="eq" style={{fontSize:'1em',padding:'10px'}}>{String.raw`$$e^x = \sum \frac{x^n}{n!}$$`}</div></div>
            <div className="c"><h4>{String.raw`$\sin x$`}</h4><div className="eq" style={{fontSize:'1em',padding:'10px'}}>{String.raw`$$\sin x = x - \frac{x^3}{3!} + ...$$`}</div></div>
            <div className="c"><h4>{String.raw`$\cos x$`}</h4><div className="eq" style={{fontSize:'1em',padding:'10px'}}>{String.raw`$$\cos x = 1 - \frac{x^2}{2!} + ...$$`}</div></div>
          </div>
        </div>
      </div>

      {/* P9: REVIEW */}
      <div id="p9" className={'pg '+(page==='p9'?'on':'')}>
        <div className="pt">📋 <span className="hl">المراجعة</span></div>
        <div className="ps">ملخص سريع</div>
        <div className="bx">
          <div className="hd"><div className="nm">1</div><h2>قوانين مهمة</h2></div>
          <div className="cs">
            <div className="c"><h4>النهايات</h4><p>{String.raw`$\frac{\sin x}{x} \to 1$`}, {String.raw`$(1+\frac{1}{x})^x \to e$`}</p></div>
            <div className="c"><h4>المشتقات</h4><p>{String.raw`$(x^n)' = nx^{n-1}$`}, {String.raw`$((fg)' = f'g + fg'$`}</p></div>
            <div className="c"><h4>التكامل</h4><p>{String.raw`$\int x^n = \frac{x^{n+1}}{n+1}$`}, {String.raw`$\int u dv = uv - \int v du$`}</p></div>
            <div className="c"><h4>لوبيتال</h4><p>{String.raw`$\lim f/g = \lim f'/g'$`}</p></div>
          </div>
        </div>
        <div className="bx">
          <div className="hd"><div className="nm">2</div><h2>نصائح</h2></div>
          <div className="cn gr"><ul>
            <li>حدد نوع المسألة أولاً</li>
            <li>ارسم عندما يمكنك</li>
            <li>لا تنسَ +C في التكامل</li>
            <li>تحقق من شروط لوبيتال</li>
          </ul></div>
        </div>
      </div>
    </main>

    <button id="fab" onClick={()=>setChat(!chat)}>🤖</button>

    <div id="cb" className={chat?'on':''}>
      <div id="ch">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div id="ca">🧮</div>
          <div><div style={{fontSize:13,fontWeight:700}}>مساعد الكالكولوس</div><div id="cs" className={typing?'b':''}>{typing?'يفكر...':'متصل'}</div></div>
        </div>
        <button id="cx" onClick={()=>setChat(false)}>✕</button>
      </div>
      <div id="cm">
        {msgs.map((m,i)=><div key={i} className={'m '+(m.role==='user'?'u':'')}><div className="ma">{m.role==='user'?'👤':'🧮'}</div><div className="mb" dangerouslySetInnerHTML={{__html:renderMath(m.content)}}/></div>)}
        {typing && <div className="m"><div className="ma">🧮</div><div className="td"><div/><div/><div/></div></div>}
        <div ref={ref}/>
      </div>
      <div id="csu">{['ما هي قاعدة لوبيتال؟','كيف أحل تكامل؟','اشرح قاعدة السلسلة'].map((q,i)=><button key={i} className="sb" onClick={()=>{setInput(q);tarea.current?.focus()}}>{q}</button>)}</div>
      <div id="ci"><div id="cr">
        <textarea ref={tarea} id="ct" placeholder="اسأل..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} rows={1}/>
        <button id="csd" onClick={send} disabled={!input.trim()||typing}>➤</button>
      </div></div>
    </div>
  </>
}
