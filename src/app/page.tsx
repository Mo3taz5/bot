'use client'

import { useState, useRef, useEffect } from 'react'

// Types
interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function CalculusEncyclopedia() {
  const [currentPage, setCurrentPage] = useState('home')
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً! أنا مساعدك في حساب التفاضل والتكامل. اسألني عن أي مفهوم أو مسألة! 🧮' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const go = (page: string) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuiz = (qId: string, isCorrect: boolean, btn: HTMLButtonElement) => {
    const resultEl = document.getElementById(qId + 'r')
    const buttons = btn.parentElement?.querySelectorAll('.qbtn')
    
    buttons?.forEach((b: Element) => {
      (b as HTMLButtonElement).disabled = true
      if ((b as HTMLButtonElement).dataset.ok === '1') {
        b.classList.add('ok')
      } else if (b === btn && !isCorrect) {
        b.classList.add('no')
      }
    })

    if (resultEl) {
      if (isCorrect) {
        resultEl.innerHTML = '✅ إجابة صحيحة! أحسنت!'
        resultEl.classList.add('ok', 'show')
      } else {
        resultEl.innerHTML = '❌ إجابة خاطئة. راجع المفهوم وحاول مرة أخرى!'
        resultEl.classList.add('no', 'show')
      }
    }
  }

  const renderMath = (text: string) => {
    // تحويل $$..$$ إلى معادلات كبيرة و $..$ إلى معادلات صغيرة
    return text
      .replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block">$$ $1 $$</div>')
      .replace(/\$([^$\n]+?)\$/g, '<span class="math-inline">$1</span>')
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return
    
    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.slice(-6)
        })
      })
      
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.error }])
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، حدث خطأ. حاول مرة أخرى!' 
      }])
    }
    setIsTyping(false)
  }

  const quickQuestions = [
    'ما هي قاعدة لوبيتال؟',
    'كيف أحل تكامل بالتعويض؟',
    'ما الفرق بين العظمى والصغرى؟',
    'اشرح لي قاعدة السلسلة'
  ]

  return (
    <>
      <style jsx global>{`
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Amiri:wght@400;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');

:root{
  --bg:#04080f;--s1:#0a1422;--s2:#0e1a2d;--s3:#122032;
  --blue:#38b6f0;--purple:#9b77f3;--pink:#ef68ac;
  --gold:#f5b93e;--green:#2fd09e;--red:#ef5c5c;--cyan:#22d3ee;
  --txt:#dde4ef;--muted:#576e88;--dim:#2e4560;
  --border:rgba(56,182,240,0.1);--border2:rgba(56,182,240,0.2);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:'Cairo',sans-serif;min-height:100vh;overflow-x:hidden;line-height:1.75}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(ellipse 70% 50% at 10% 5%,rgba(56,182,240,0.055) 0%,transparent 55%),
    radial-gradient(ellipse 55% 70% at 88% 88%,rgba(155,119,243,0.04) 0%,transparent 55%);}

/* Math Styling */
.math-block{background:linear-gradient(135deg,rgba(56,182,240,0.08),rgba(155,119,243,0.08));
  border:1px solid rgba(56,182,240,0.2);border-radius:12px;padding:20px 24px;margin:16px 0;
  font-size:1.25em;text-align:center;direction:ltr;overflow-x:auto;
  font-family:'Times New Roman',serif;color:var(--blue);}
.math-inline{background:rgba(56,182,240,0.1);padding:2px 8px;border-radius:6px;
  font-family:'Times New Roman',serif;color:var(--cyan);direction:ltr;}

header{position:relative;z-index:2;text-align:center;padding:72px 24px 52px;
  border-bottom:1px solid var(--border);background:linear-gradient(180deg,rgba(56,182,240,0.04) 0%,transparent 100%);}
.site-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(56,182,240,0.08);
  border:1px solid rgba(56,182,240,0.22);color:var(--blue);padding:5px 18px;
  border-radius:999px;font-size:11px;letter-spacing:2px;font-weight:700;text-transform:uppercase;margin-bottom:22px;}
header h1{font-family:'Amiri',serif;font-size:clamp(30px,6vw,66px);font-weight:700;
  background:linear-gradient(125deg,#38b6f0 0%,#9b77f3 45%,#ef68ac 80%,#f5b93e 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;margin-bottom:14px;}
header p{color:var(--muted);font-size:17px;max-width:640px;margin:0 auto 28px;}
.sr{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;}
.sn{font-size:30px;font-weight:900;color:var(--blue);display:block;font-family:'Amiri',serif}
.sl{font-size:12px;color:var(--muted);}

#nav{position:sticky;top:0;z-index:200;background:rgba(4,8,15,0.94);backdrop-filter:blur(28px);border-bottom:1px solid var(--border);}
.nvi{display:flex;max-width:1200px;margin:0 auto;overflow-x:auto;scrollbar-width:none;}
.nvi::-webkit-scrollbar{display:none}
.nb{display:flex;align-items:center;gap:6px;padding:13px 15px;color:var(--muted);background:none;
  border:none;border-bottom:2px solid transparent;font-family:'Cairo',sans-serif;font-size:12px;
  font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
.nb:hover{color:var(--blue);background:rgba(56,182,240,0.04)}
.nb.on{color:var(--blue);border-bottom-color:var(--blue);background:rgba(56,182,240,0.06)}

main{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:48px 20px 120px}
.pg{display:none;animation:pgIn .35s ease}
.pg.on{display:block}
@keyframes pgIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

.pt{font-family:'Amiri',serif;font-size:clamp(26px,4.5vw,44px);font-weight:700;margin-bottom:8px;}
.pt .hl{background:linear-gradient(120deg,var(--blue),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ps{color:var(--muted);font-size:15px;margin-bottom:36px;}

.lbox{background:var(--s1);border:1px solid var(--border);border-radius:20px;padding:36px;margin-bottom:32px;position:relative;overflow:hidden;}
.lbox::before{content:'';position:absolute;top:0;right:0;width:3px;height:100%;background:linear-gradient(180deg,var(--blue),var(--purple));}
.lhead{display:flex;align-items:center;gap:14px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);}
.lnum{background:linear-gradient(135deg,var(--blue),var(--purple));color:#000;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;flex-shrink:0;}
.lbox h2{font-size:22px;font-weight:700;line-height:1.3}
.lbox h2 small{display:block;font-size:12px;color:var(--muted);font-weight:400;margin-top:3px;}
.lbox h3{font-size:16px;font-weight:700;margin:26px 0 13px;color:var(--txt);padding-bottom:8px;border-bottom:1px solid var(--border);}

.analogy{background:linear-gradient(135deg,rgba(155,119,243,0.06),rgba(56,182,240,0.06));border:1px dashed rgba(155,119,243,0.28);border-radius:15px;padding:22px 24px;margin:20px 0;}
.albl{font-size:10px;font-weight:700;color:var(--purple);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;}
.analogy p{color:var(--txt);font-size:14px;line-height:1.9}

.con{background:var(--s2);border-radius:14px;padding:20px 22px;margin:18px 0;border-right:3px solid var(--blue)}
.con.p{border-right-color:var(--pink)}.con.pp{border-right-color:var(--purple)}.con.g{border-right-color:var(--gold)}.con.gr{border-right-color:var(--green)}.con.r{border-right-color:var(--red)}
.con h4{font-size:13px;font-weight:700;margin-bottom:10px;color:var(--blue)}
.con.p h4{color:var(--pink)}.con.pp h4{color:var(--purple)}.con.g h4{color:var(--gold)}.con.gr h4{color:var(--green)}.con.r h4{color:var(--red)}
.con p,.con li{color:var(--muted);font-size:13.5px;line-height:1.9}
.con ul,.con ol{padding-right:20px}.con li{margin-bottom:7px}

.fml{background:rgba(56,182,240,0.05);border:1px solid rgba(56,182,240,0.18);border-radius:12px;padding:16px 22px;margin:14px 0;font-family:'Times New Roman',monospace;font-size:clamp(13px,2vw,17px);color:var(--blue);text-align:center;direction:ltr;}
.fml.p{background:rgba(239,104,172,0.05);border-color:rgba(239,104,172,0.2);color:var(--pink)}
.fml.pp{background:rgba(155,119,243,0.05);border-color:rgba(155,119,243,0.2);color:var(--purple)}
.fml.g{background:rgba(245,185,62,0.05);border-color:rgba(245,185,62,0.2);color:var(--gold)}
.fml.gr{background:rgba(47,208,158,0.05);border-color:rgba(47,208,158,0.2);color:var(--green)}
.fml.r{background:rgba(239,92,92,0.05);border-color:rgba(239,92,92,0.2);color:var(--red)}
.fml.big{font-size:clamp(15px,2.5vw,21px);padding:20px 26px;}
.flbl{font-size:11px;color:var(--muted);text-align:right;margin:-6px 0 14px;font-family:'Cairo',sans-serif;}

.ex{background:rgba(47,208,158,0.04);border:1px solid rgba(47,208,158,0.17);border-radius:14px;padding:21px 23px;margin:18px 0;}
.exlbl{font-size:10px;font-weight:700;color:var(--green);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px;}
.ex p{color:var(--muted);font-size:13.5px;line-height:1.9;}

.steps{margin:14px 0}
.step{display:flex;gap:14px;margin-bottom:14px;align-items:flex-start}
.snum{background:rgba(56,182,240,0.12);color:var(--blue);width:30px;height:30px;min-width:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;margin-top:3px;}
.step p{color:var(--muted);font-size:13.5px;line-height:1.9}.step p strong{color:var(--txt)}

.note{border-radius:12px;padding:15px 20px;margin:16px 0;display:flex;gap:11px;align-items:flex-start;}
.note.w{background:rgba(245,185,62,0.06);border:1px solid rgba(245,185,62,0.22);}
.note.i{background:rgba(56,182,240,0.05);border:1px solid rgba(56,182,240,0.18);}
.note.d{background:rgba(239,92,92,0.06);border:1px solid rgba(239,92,92,0.2);}
.nic{font-size:18px;flex-shrink:0;margin-top:2px}.note p{color:var(--muted);font-size:13.5px;line-height:1.75}
.note.w strong{color:var(--gold)}.note.i strong{color:var(--blue)}.note.d strong{color:var(--red)}

table.tbl{width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;}
.tbl th{background:rgba(56,182,240,0.08);color:var(--blue);padding:11px 14px;text-align:right;border:1px solid var(--border);font-weight:700;}
.tbl td{padding:10px 14px;border:1px solid var(--border);color:var(--muted);vertical-align:middle}
.tbl tr:hover td{background:rgba(255,255,255,0.02)}
.tbl .c{font-family:'Courier New',monospace;color:var(--blue);direction:ltr;text-align:center;font-size:12px;}
.tbl .cv{font-family:'Courier New',monospace;color:var(--green);direction:ltr;text-align:center;font-size:12px;}
.tbl .cr{font-family:'Courier New',monospace;color:var(--red);direction:ltr;text-align:center;font-size:12px;}

.fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:11px;margin:18px 0}
.fc{background:var(--s2);border:1px solid var(--border);border-radius:11px;padding:13px;text-align:center;transition:border-color .2s}
.fc:hover{border-color:var(--border2)}
.fn{font-size:10.5px;color:var(--muted);margin-bottom:6px;font-weight:600;}
.fe{font-family:'Times New Roman',monospace;font-size:14px;color:var(--blue);direction:ltr;}
.fc.p .fe{color:var(--pink)}.fc.pp .fe{color:var(--purple)}.fc.g .fe{color:var(--gold)}.fc.gr .fe{color:var(--green)}

.cases{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:15px;margin:18px 0}
.cc{background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;}
.cch{display:flex;align-items:center;gap:9px;margin-bottom:10px;}
.cbdg{padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.5px;}
.cc h4{font-size:13.5px;font-weight:700;color:var(--txt)}.cc p{color:var(--muted);font-size:13px;line-height:1.8;}

.quiz{background:var(--s2);border:1px solid var(--border);border-radius:18px;padding:26px;margin:30px 0}
.qt2{font-size:14px;font-weight:700;color:var(--purple);margin-bottom:4px;}
.qb{margin-top:20px}
.qq{color:var(--txt);font-size:14.5px;font-weight:600;background:rgba(0,0,0,0.25);padding:13px 17px;border-radius:10px;margin-bottom:13px;direction:ltr;text-align:center;font-family:'Times New Roman',monospace;}
.qo{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px}
.qbtn{background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--txt);padding:11px 14px;border-radius:10px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:13px;transition:all .2s;direction:ltr;}
.qbtn:hover:not(:disabled){background:rgba(56,182,240,0.07);border-color:var(--border2)}
.qbtn.ok{background:rgba(47,208,158,0.14);border-color:var(--green);color:var(--green)}
.qbtn.no{background:rgba(239,92,92,0.1);border-color:var(--red);color:var(--red)}
.qr{display:none;padding:13px 16px;border-radius:10px;font-size:13.5px;margin-top:9px;line-height:1.75}
.qr.show{display:block}.qr.ok{background:rgba(47,208,158,0.08);color:var(--green);border:1px solid rgba(47,208,158,0.2);}
.qr.no{background:rgba(239,92,92,0.06);color:#f87171;border:1px solid rgba(239,92,92,0.18);}

.hd v{height:1px;background:var(--border);margin:28px 0}
.hgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px;margin:28px 0}
.hc{background:var(--s1);border:1px solid var(--border);border-radius:18px;padding:26px;cursor:pointer;transition:all .3s;}
.hc:hover{transform:translateY(-5px);border-color:var(--border2);box-shadow:0 20px 55px rgba(0,0,0,0.5)}
.hci{font-size:40px;margin-bottom:12px;display:block}.hc h3{font-size:17px;font-weight:700;margin-bottom:7px}
.hc p{color:var(--muted);font-size:13px;line-height:1.7}

/* AI chat */
#fab{position:fixed;bottom:28px;left:28px;width:60px;height:60px;border-radius:50%;border:none;background:linear-gradient(135deg,#38b6f0,#9b77f3);display:flex;align-items:center;justify-content:center;font-size:25px;cursor:pointer;z-index:9999;box-shadow:0 8px 28px rgba(56,182,240,0.5);transition:transform .3s;user-select:none;}
#fab:hover{transform:scale(1.1)}
#chatbox{position:fixed;bottom:104px;left:22px;width:385px;max-width:calc(100vw - 38px);height:560px;max-height:calc(100vh - 130px);background:#060d18;border:1px solid rgba(56,182,240,0.2);border-radius:22px;display:flex;flex-direction:column;z-index:9998;box-shadow:0 28px 80px rgba(0,0,0,0.8);transform:scale(.84) translateY(30px);opacity:0;pointer-events:none;transition:all .36s cubic-bezier(.34,1.56,.64,1);transform-origin:bottom left;overflow:hidden;}
#chatbox.on{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
#cbhdr{background:linear-gradient(135deg,rgba(56,182,240,0.1),rgba(155,119,243,0.1));padding:14px 17px;border-bottom:1px solid rgba(56,182,240,0.12);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
#cbav{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#38b6f0,#9b77f3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
#cbst{font-size:11px;color:var(--green);margin-top:2px;}
#cbst.busy{color:var(--gold);animation:blink 1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
#cbx{background:rgba(255,255,255,0.05);border:none;color:var(--muted);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;transition:all .2s;}
#cbx:hover{background:rgba(255,255,255,0.1);color:var(--txt)}
#cbmsgs{flex:1;overflow-y:auto;padding:16px 13px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth;}
#cbmsgs::-webkit-scrollbar{width:3px}#cbmsgs::-webkit-scrollbar-thumb{background:rgba(56,182,240,0.18);border-radius:2px}
.cm{display:flex;gap:9px;align-items:flex-start;animation:min .3s ease}
@keyframes min{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cm.u{flex-direction:row-reverse}
.cma{width:32px;height:32px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,#38b6f0,#9b77f3);display:flex;align-items:center;justify-content:center;font-size:15px;}
.cm.u .cma{background:linear-gradient(135deg,#ef68ac,#f5b93e)}
.cbb{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:15px;border-top-right-radius:3px;padding:11px 14px;font-size:13px;line-height:1.8;color:var(--txt);max-width:268px;word-break:break-word;white-space:pre-wrap;}
.cm.u .cbb{background:linear-gradient(135deg,rgba(56,182,240,0.11),rgba(155,119,243,0.11));border-color:rgba(56,182,240,0.18);border-top-right-radius:15px;border-top-left-radius:3px;text-align:right;}
.cbb .fb{font-family:'Times New Roman',monospace;background:rgba(56,182,240,0.07);border:1px solid rgba(56,182,240,0.14);padding:8px 12px;border-radius:9px;color:#7dd3fc;font-size:12px;direction:ltr;display:block;margin:8px 0;text-align:center;}
.tdots{display:flex;gap:4px;align-items:center;padding:12px 15px}
.td{width:6px;height:6px;border-radius:50%;background:var(--blue);animation:tb 1.2s infinite}
.td:nth-child(2){animation-delay:.22s}.td:nth-child(3){animation-delay:.44s}
@keyframes tb{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
.ql{color:var(--blue);cursor:pointer;text-decoration:underline;text-underline-offset:3px;font-size:13px;}
.ql:hover{color:var(--purple)}
#cbsugg{display:flex;gap:6px;padding:8px 13px 0;overflow-x:auto;flex-shrink:0;scrollbar-width:none;}
#cbsugg::-webkit-scrollbar{display:none}
.csb{background:rgba(56,182,240,0.07);border:1px solid rgba(56,182,240,0.17);color:var(--muted);padding:5px 11px;border-radius:999px;font-family:'Cairo',sans-serif;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0;}
.csb:hover{background:rgba(56,182,240,0.13);color:var(--blue);border-color:rgba(56,182,240,0.35)}
#cbia{padding:9px 13px 13px;border-top:1px solid rgba(56,182,240,0.09);flex-shrink:0;background:rgba(0,0,0,0.2);}
#cbrow{display:flex;gap:9px;align-items:flex-end;margin-top:9px}
#cbta{flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(56,182,240,0.18);border-radius:13px;color:var(--txt);font-family:'Cairo',sans-serif;font-size:13px;padding:10px 13px;resize:none;outline:none;transition:border-color .2s;max-height:108px;line-height:1.55;direction:rtl;}
#cbta:focus{border-color:rgba(56,182,240,0.45);background:rgba(56,182,240,0.03)}
#cbta::placeholder{color:#1e3550}
#cbsend{background:linear-gradient(135deg,#38b6f0,#9b77f3);border:none;color:#000;width:42px;height:42px;border-radius:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;}
#cbsend:hover{transform:scale(1.07);box-shadow:0 5px 16px rgba(56,182,240,0.45)}
#cbsend:disabled{opacity:.3;cursor:not-allowed;transform:none}

::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(56,182,240,0.25);border-radius:3px}
@media(max-width:680px){.lbox{padding:20px 15px}.fgrid{grid-template-columns:1fr 1fr}.qo{grid-template-columns:1fr}.cases{grid-template-columns:1fr}#chatbox{bottom:96px;left:8px;right:8px;width:auto;max-width:none}#fab{bottom:22px;left:22px}}
      `}</style>

      {/* Header */}
      <header>
        <div className="site-badge">📚 موسوعة كالكولوس 1 و 2 — شرح كامل</div>
        <h1>حساب التفاضل والتكامل</h1>
        <p>الشرح الأشمل بالعربية — كل مفهوم، كل حالة، كل تقنية، مع أمثلة محلولة خطوة بخطوة</p>
        <div className="sr">
          <div><span className="sn">10</span><span className="sl">أبواب رئيسية</span></div>
          <div><span className="sn">80+</span><span className="sl">مفهوم مشروح</span></div>
          <div><span className="sn">150+</span><span className="sl">قانون وصيغة</span></div>
          <div><span className="sn">60+</span><span className="sl">مثال محلول</span></div>
        </div>
      </header>

      {/* Navigation */}
      <nav id="nav">
        <div className="nvi">
          {[
            { id: 'home', label: '🏠 البداية' },
            { id: 'p1', label: '📐 النهايات' },
            { id: 'p2', label: '〰️ الاستمرارية' },
            { id: 'p3', label: '📈 المشتقات' },
            { id: 'p4', label: '🎯 تطبيقات المشتقة' },
            { id: 'p5', label: '∫ التكامل' },
            { id: 'p6', label: '🔧 تقنيات التكامل' },
            { id: 'p7', label: '📏 تطبيقات التكامل' },
            { id: 'p8', label: '∑ المتسلسلات' },
            { id: 'p9', label: '📋 المراجعة' },
            { id: 'p10', label: '📝 مسائل محلولة' },
          ].map(item => (
            <button
              key={item.id}
              className={`nb ${currentPage === item.id ? 'on' : ''}`}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {/* HOME PAGE */}
        <div id="home" className={`pg ${currentPage === 'home' ? 'on' : ''}`}>
          <div className="pt">مرحباً! <span className="hl">ابدأ رحلتك هنا 🚀</span></div>
          <div className="ps">دليلك الشامل لحساب التفاضل والتكامل — من الصفر للاحتراف بأسلوب عربي واضح</div>
          <div className="analogy">
            <div className="albl">💡 لماذا نتعلم هذا؟</div>
            <p>كل شيء في الكون يتغير ويتحرك. حساب التفاضل والتكامل هو العلم الذي يصف هذا التغير بدقة رياضية. ستجده في الفيزياء والهندسة والاقتصاد والطب والذكاء الاصطناعي. بكلمة واحدة: هو <strong>لغة الطبيعة</strong>.</p>
          </div>
          <div className="hgrid">
            <div className="hc" onClick={() => go('p1')}><span className="hci">📐</span><h3 style={{color:'var(--blue)'}}>النهايات</h3><p>كل حالات 0/0 و∞/∞ والجانبية ولوبيتال والحصار — الأساس النظري للكل.</p></div>
            <div className="hc" onClick={() => go('p2')}><span className="hci">〰️</span><h3 style={{color:'var(--cyan)'}}>الاستمرارية</h3><p>متى الدالة بلا قفزات؟ الأنواع الثلاثة للانقطاع ومبرهنة IVT.</p></div>
            <div className="hc" onClick={() => go('p3')}><span className="hci">📈</span><h3 style={{color:'var(--purple)'}}>المشتقات</h3><p>قاعدة القوة والسلسلة والضرب والقسمة والضمني واللوغاريتمي — كل القواعد.</p></div>
            <div className="hc" onClick={() => go('p4')}><span className="hci">🎯</span><h3 style={{color:'var(--pink)'}}>تطبيقات المشتقة</h3><p>العظمى والصغرى وخط المماس والتحسين وMVT ورسم الدوال.</p></div>
            <div className="hc" onClick={() => go('p5')}><span className="hci">∫</span><h3 style={{color:'var(--gold)'}}>التكامل</h3><p>مجموع ريمان والمبرهنة الأساسية وكل التكاملات الأساسية.</p></div>
            <div className="hc" onClick={() => go('p6')}><span className="hci">🔧</span><h3 style={{color:'var(--green)'}}>تقنيات التكامل</h3><p>التعويض والتجزئة والتعويض المثلثي والكسور الجزئية.</p></div>
            <div className="hc" onClick={() => go('p7')}><span className="hci">📏</span><h3 style={{color:'var(--cyan)'}}>تطبيقات التكامل</h3><p>المساحات والحجوم وطول القوس والمساحة السطحية.</p></div>
            <div className="hc" onClick={() => go('p8')}><span className="hci">∑</span><h3 style={{color:'var(--purple)'}}>المتسلسلات</h3><p>اختبارات التقارب وتايلور وماكلورين.</p></div>
          </div>
          <div className="note i"><div className="nic">🤖</div><p><strong>المساعد الذكي:</strong> اضغط الزر الأزرق في أسفل اليسار لتسأل عن أي مفهوم أو تطلب حل أي مسألة!</p></div>
        </div>

        {/* PAGE 1: LIMITS */}
        <div id="p1" className={`pg ${currentPage === 'p1' ? 'on' : ''}`}>
          <div className="pt">📐 <span className="hl">النهايات</span></div>
          <div className="ps">كل حالات النهايات الشائعة مع أمثلة محلولة كاملة</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>مفهوم النهاية<small>The Limit Concept</small></h2></div>
            <div className="analogy">
              <div className="albl">🚶 تشبيه الاقتراب</div>
              <p>تمشي نحو جدار وكل خطوة تقطع نصف المسافة المتبقية. لن تصل أبداً لكنك تقترب أكثر وأكثر. النهاية تسأل: «ماذا تقترب منه؟» وليس «هل وصلت؟».</p>
            </div>
            <div className="fml big">limₓ→ₐ f(x) = L</div>
            <div className="flbl">«نهاية f(x) عندما x تقترب من a تساوي L»</div>
            
            <h3>الحالات الستة الشائعة</h3>
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(47,208,158,0.15)',color:'var(--green)'}}>حالة 1</span><h4>التعويض المباشر</h4></div>
                <p>الدالة متصلة — عوّض مباشرة</p>
                <div className="fml gr" style={{fontSize:'13px'}}>limₓ→₃(x²+1) = 10 ✓</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(245,185,62,0.15)',color:'var(--gold)'}}>حالة 2</span><h4>الشكل 0/0</h4></div>
                <p>تبسيط: تحليل، ضرب بالمرافق، أو لوبيتال</p>
                <div className="fml g" style={{fontSize:'13px'}}>lim(x²-4)/(x-2) = lim(x+2) = 4</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>حالة 3</span><h4>الشكل ∞/∞</h4></div>
                <p>اقسم على أعلى قوة في المقام</p>
                <div className="fml p" style={{fontSize:'13px'}}>lim(3x²+1)/(x²-2) = 3</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(155,119,243,0.15)',color:'var(--purple)'}}>حالة 4</span><h4>النهايات اللانهائية</h4></div>
                <p>x→±∞ أو f→±∞</p>
                <div className="fml pp" style={{fontSize:'13px'}}>limₓ→∞ 1/xⁿ = 0 (n &gt; 0)</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(56,182,240,0.15)',color:'var(--blue)'}}>حالة 5</span><h4>الحدود الجانبية</h4></div>
                <p>النهاية موجودة ⟺ الجانبيان متساويان</p>
                <div className="fml" style={{fontSize:'12px'}}>limₓ→ₐ⁺f = limₓ→ₐ⁻f</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,104,172,0.15)',color:'var(--pink)'}}>حالة 6</span><h4>الأشكال 0·∞ و ∞-∞</h4></div>
                <p>حوّل لـ 0/0 أو ∞/∞ ثم لوبيتال</p>
                <div className="fml p" style={{fontSize:'12px'}}>0·∞ → f/(1/g)</div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>قاعدة لوبيتال<small>L'Hôpital's Rule</small></h2></div>
            
            <div className="con g">
              <h4>⚠️ شروط التطبيق</h4>
              <ul>
                <li>الشكل يجب أن يكون <strong>بالضبط</strong> 0/0 أو ∞/∞</li>
                <li>تُشتق f و g كل منهما على حدة</li>
                <li>إذا أعطى شكلاً غير محدداً مرة أخرى، طبّق مجدداً</li>
              </ul>
            </div>
            
            <div className="fml g big">lim f/g = 0/0 أو ∞/∞ ⟹ lim f'(x)/g'(x)</div>
            
            <div className="ex">
              <div className="exlbl">✏️ مثال: limₓ→₀ (sin x - x)/x³</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>التعويض: 0/0 ← لوبيتال أول</p></div>
                <div className="step"><div className="snum">2</div><p>lim (cos x - 1)/(3x²) = 0/0 ← لوبيتال ثاني</p></div>
                <div className="step"><div className="snum">3</div><p>lim (-sin x)/(6x) = 0/0 ← لوبيتال ثالث</p></div>
                <div className="step"><div className="snum">4</div><p><strong>lim (-cos x)/6 = -1/6 ✓</strong></p></div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>النهايات الأساسية<small>Must-Know Limits</small></h2></div>
            <div className="fgrid">
              <div className="fc gr"><div className="fn">sinθ/θ عند θ→0</div><div className="fe">= 1 ⭐</div></div>
              <div className="fc p"><div className="fn">(1-cosθ)/θ عند θ→0</div><div className="fe">= 0</div></div>
              <div className="fc pp"><div className="fn">tanθ/θ عند θ→0</div><div className="fe">= 1</div></div>
              <div className="fc g"><div className="fn">(eˣ-1)/x عند x→0</div><div className="fe">= 1</div></div>
              <div className="fc"><div className="fn">(1+x)^(1/x) عند x→0</div><div className="fe">= e</div></div>
              <div className="fc p"><div className="fn">(1+1/x)^x عند x→∞</div><div className="fe">= e</div></div>
              <div className="fc gr"><div className="fn">ln(1+x)/x عند x→0</div><div className="fe">= 1</div></div>
              <div className="fc pp"><div className="fn">1/xᵖ عند x→∞ (p &gt; 0)</div><div className="fe">= 0</div></div>
            </div>
          </div>

          <div className="quiz">
            <div className="qt2">🎯 اختبر نفسك — النهايات</div>
            <div className="qb">
              <div className="qq">limₓ→₀ (sin 5x)/(sin 3x) = ?</div>
              <div className="qo">
                <button className="qbtn" onClick={(e) => handleQuiz('ql1', false, e.currentTarget)}>1</button>
                <button className="qbtn" onClick={(e) => handleQuiz('ql1', true, e.currentTarget)}>5/3</button>
                <button className="qbtn" onClick={(e) => handleQuiz('ql1', false, e.currentTarget)}>3/5</button>
                <button className="qbtn" onClick={(e) => handleQuiz('ql1', false, e.currentTarget)}>0</button>
              </div>
              <div className="qr" id="ql1r"></div>
            </div>
          </div>
        </div>

        {/* PAGE 5: INTEGRALS */}
        <div id="p5" className={`pg ${currentPage === 'p5' ? 'on' : ''}`}>
          <div className="pt">∫ <span className="hl">التكامل</span></div>
          <div className="ps">الأساس والمبرهنة الأساسية والتكاملات الأساسية</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>التكامل غير المحدد<small>Indefinite Integral</small></h2></div>
            
            <div className="fml big">∫ f(x) dx = F(x) + C</div>
            <div className="flbl">F هي الاشتقاق العكسي (Antiderivative)</div>

            <h3>التكاملات الأساسية</h3>
            <div className="fgrid">
              <div className="fc"><div className="fn">∫ xⁿ dx</div><div className="fe">= xⁿ⁺¹/(n+1) + C</div></div>
              <div className="fc gr"><div className="fn">∫ 1/x dx</div><div className="fe">= ln|x| + C</div></div>
              <div className="fc p"><div className="fn">∫ eˣ dx</div><div className="fe">= eˣ + C</div></div>
              <div className="fc pp"><div className="fn">∫ aˣ dx</div><div className="fe">= aˣ/ln a + C</div></div>
              <div className="fc g"><div className="fn">∫ sin x dx</div><div className="fe">= -cos x + C</div></div>
              <div className="fc"><div className="fn">∫ cos x dx</div><div className="fe">= sin x + C</div></div>
              <div className="fc p"><div className="fn">∫ sec²x dx</div><div className="fe">= tan x + C</div></div>
              <div className="fc gr"><div className="fn">∫ 1/(1+x²) dx</div><div className="fe">= arctan x + C</div></div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>المبرهنة الأساسية للتکامل<small>Fundamental Theorem</small></h2></div>
            
            <div className="fml pp big">∫ₐᵇ f(x) dx = F(b) - F(a)</div>
            
            <div className="ex">
              <div className="exlbl">✏️ مثال: ∫₀² x² dx</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>F(x) = x³/3</p></div>
                <div className="step"><div className="snum">2</div><p>= F(2) - F(0)</p></div>
                <div className="step"><div className="snum">3</div><p>= 8/3 - 0 = <strong>8/3 ✓</strong></p></div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 10: SOLVED PROBLEMS */}
        <div id="p10" className={`pg ${currentPage === 'p10' ? 'on' : ''}`}>
          <div className="pt">📝 <span className="hl">مسائل محلولة من الامتحانات</span></div>
          <div className="ps">مسائل حقيقية مع شرح خطوة بخطوة! 🎯</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>تكامل أسي معقد</h2></div>
            
            <div className="fml big">∫ e³ˣ/(e²ˣ + 2eˣ - 3) dx</div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>التعويض:</strong> u = eˣ → du = eˣ dx</p></div>
                <div className="step"><div className="snum">2</div><p><strong>تحويل:</strong> e³ˣ dx = e²ˣ · eˣ dx = u² du</p></div>
                <div className="step"><div className="snum">3</div><p><strong>تحليل المقام:</strong> u² + 2u - 3 = (u+3)(u-1)</p></div>
                <div className="step"><div className="snum">4</div><p><strong>الكسور الجزئية:</strong> u/[(u+3)(u-1)] = 3/4·1/(u+3) + 1/4·1/(u-1)</p></div>
                <div className="step"><div className="snum">5</div><p><strong>= 3/4 ln|eˣ+3| + 1/4 ln|eˣ-1| + C ✓</strong></p></div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>مساحة بين منحنيات</h2></div>
            
            <div className="fml">f(x) = x² + 11, g(x) = x⁴ - 1</div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>نقاط التقاطع:</strong> x² + 11 = x⁴ - 1</p></div>
                <div className="step"><div className="snum">2</div><p>x⁴ - x² - 12 = 0 → x = ±2</p></div>
                <div className="step"><div className="snum">3</div><p><strong>A = ∫₋₂² [(x²+11) - (x⁴-1)] dx</strong></p></div>
                <div className="step"><div className="snum">4</div><p><strong>= 1432/15 ≈ 95.5 وحدة² ✓</strong></p></div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>معادلة تفاضلية من الدرجة الثانية</h2></div>
            
            <div className="fml big">y'' - 2y' + 2y = 0</div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>المعادلة المميزة:</strong> r² - 2r + 2 = 0</p></div>
                <div className="step"><div className="snum">2</div><p><strong>الجذور:</strong> r = 1 ± i</p></div>
                <div className="step"><div className="snum">3</div><p><strong>الحل العام:</strong> y = eˣ(C₁ cos x + C₂ sin x) ✓</p></div>
              </div>
            </div>
          </div>

          <div className="note i">
            <div className="nic">💡</div>
            <p><strong>نصيحة:</strong> اسأل المساعد الذكي لأي مسألة إضافية! يضغط الزر الأزرق في أسفل اليسار.</p>
          </div>
        </div>
      </main>

      {/* FAB Button */}
      <button id="fab" onClick={() => setChatOpen(!chatOpen)}>🤖</button>

      {/* Chat Box */}
      <div id="chatbox" className={chatOpen ? 'on' : ''}>
        <div id="cbhdr">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div id="cbav">🧮</div>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>مساعد الكالكولوس</div>
              <div id="cbst" className={isTyping ? 'busy' : ''}>{isTyping ? 'يفكر...' : 'متصل'}</div>
            </div>
          </div>
          <button id="cbx" onClick={() => setChatOpen(false)}>✕</button>
        </div>
        
        <div id="cbmsgs">
          {messages.map((msg, i) => (
            <div key={i} className={`cm ${msg.role === 'user' ? 'u' : ''}`}>
              <div className="cma">{msg.role === 'user' ? '👤' : '🧮'}</div>
              <div className="cbb" dangerouslySetInnerHTML={{ __html: renderMath(msg.content) }} />
            </div>
          ))}
          {isTyping && (
            <div className="cm">
              <div className="cma">🧮</div>
              <div className="tdots">
                <div className="td"></div>
                <div className="td"></div>
                <div className="td"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div id="cbsugg">
          {quickQuestions.map((q, i) => (
            <button key={i} className="csb" onClick={() => { setInputValue(q); textareaRef.current?.focus(); }}>
              {q}
            </button>
          ))}
        </div>

        <div id="cbia">
          <div id="cbrow">
            <textarea
              ref={textareaRef}
              id="cbta"
              placeholder="اسأل عن أي مفهوم في التفاضل والتكامل..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
            />
            <button id="cbsend" onClick={sendMessage} disabled={!inputValue.trim() || isTyping}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
