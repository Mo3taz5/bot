'use client'

import { useState, useRef, useEffect } from 'react'

// Types
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HealthStatus {
  status: string
  stats: {
    totalLogs: number
    errors: number
    warnings: number
    improvements: number
  }
  recentLogs: Array<{
    timestamp: string
    type: string
    message: string
  }>
}

export default function CalculusEncyclopedia() {
  const [currentPage, setCurrentPage] = useState('home')
  const [chatOpen, setChatOpen] = useState(false)
  const [serverPanelOpen, setServerPanelOpen] = useState(false)
  const [serverHealth, setServerHealth] = useState<HealthStatus | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً! أنا مساعدك في حساب التفاضل والتكامل. اسألني عن أي مفهوم أو مسألة! 🧮' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // فحص صحة السيرفر
  const checkServerHealth = async () => {
    try {
      const res = await fetch('/api/self-improve')
      const data = await res.json()
      setServerHealth(data)
    } catch {
      setServerHealth({ status: 'error', stats: { totalLogs: 0, errors: 0, warnings: 0, improvements: 0 }, recentLogs: [] })
    }
  }

  // تحسين الكود
  const improveServerCode = async () => {
    try {
      const res = await fetch('/api/self-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health-check' })
      })
      const data = await res.json()
      console.log('تحسين:', data)
      checkServerHealth()
    } catch (err) {
      console.error('خطأ في التحسين:', err)
    }
  }

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/self-improve')
        const data = await res.json()
        setServerHealth(data)
      } catch {
        setServerHealth({ status: 'error', stats: { totalLogs: 0, errors: 0, warnings: 0, improvements: 0 }, recentLogs: [] })
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
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
.fml{background:rgba(56,182,240,0.05);border:1px solid rgba(56,182,240,0.18);border-radius:12px;padding:16px 22px;margin:14px 0;font-family:'Courier New',monospace;font-size:clamp(13px,2vw,17px);color:var(--blue);text-align:center;direction:ltr;}
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
.fe{font-family:'Courier New',monospace;font-size:14px;color:var(--blue);direction:ltr;}
.fc.p .fe{color:var(--pink)}.fc.pp .fe{color:var(--purple)}.fc.g .fe{color:var(--gold)}.fc.gr .fe{color:var(--green)}
.cases{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:15px;margin:18px 0}
.cc{background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;}
.cch{display:flex;align-items:center;gap:9px;margin-bottom:10px;}
.cbdg{padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.5px;}
.cc h4{font-size:13.5px;font-weight:700;color:var(--txt)}.cc p{color:var(--muted);font-size:13px;line-height:1.8;}
.quiz{background:var(--s2);border:1px solid var(--border);border-radius:18px;padding:26px;margin:30px 0}
.qt2{font-size:14px;font-weight:700;color:var(--purple);margin-bottom:4px;}
.qb{margin-top:20px}
.qq{color:var(--txt);font-size:14.5px;font-weight:600;background:rgba(0,0,0,0.25);padding:13px 17px;border-radius:10px;margin-bottom:13px;direction:ltr;text-align:center;font-family:'Courier New',monospace;}
.qo{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px}
.qbtn{background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--txt);padding:11px 14px;border-radius:10px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:13px;transition:all .2s;direction:ltr;}
.qbtn:hover:not(:disabled){background:rgba(56,182,240,0.07);border-color:var(--border2)}
.qbtn.ok{background:rgba(47,208,158,0.14);border-color:var(--green);color:var(--green)}
.qbtn.no{background:rgba(239,92,92,0.1);border-color:var(--red);color:var(--red)}
.qr{display:none;padding:13px 16px;border-radius:10px;font-size:13.5px;margin-top:9px;line-height:1.75}
.qr.show{display:block}.qr.ok{background:rgba(47,208,158,0.08);color:var(--green);border:1px solid rgba(47,208,158,0.2);}
.qr.no{background:rgba(239,92,92,0.06);color:#f87171;border:1px solid rgba(239,92,92,0.18);}
.hdv{height:1px;background:var(--border);margin:28px 0}
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
.cbb .fb{font-family:'Courier New',monospace;background:rgba(56,182,240,0.07);border:1px solid rgba(56,182,240,0.14);padding:8px 12px;border-radius:9px;color:#7dd3fc;font-size:12px;direction:ltr;display:block;margin:8px 0;text-align:center;}
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
            <div className="hc" onClick={() => go('p6')}><span className="hci">🔧</span><h3 style={{color:'var(--green)'}}>تقنيات التكامل</h3><p>التعويض والتجزئة والتعويض المثلثي والكسور الجزئية والهويات المثلثية.</p></div>
            <div className="hc" onClick={() => go('p7')}><span className="hci">📏</span><h3 style={{color:'var(--cyan)'}}>تطبيقات التكامل</h3><p>المساحات والحجوم الثلاثية وطول القوس والمساحة السطحية.</p></div>
            <div className="hc" onClick={() => go('p8')}><span className="hci">∑</span><h3 style={{color:'var(--purple)'}}>المتسلسلات</h3><p>6 اختبارات تقارب ومتسلسلة تايلور وماكلورين وعمليات المتسلسلات.</p></div>
          </div>
          <div className="note i"><div className="nic">🤖</div><p><strong>المساعد الذكي:</strong> اضغط الزر الأزرق في أسفل اليسار لتسأل عن أي مفهوم أو تطلب حل أي مسألة خطوة بخطوة!</p></div>
        </div>

        {/* PAGE 1: LIMITS */}
        <div id="p1" className={`pg ${currentPage === 'p1' ? 'on' : ''}`}>
          <div className="pt">📐 <span className="hl">النهايات</span></div>
          <div className="ps">كل حالات النهايات الشائعة مع أمثلة محلولة كاملة</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>مفهوم النهاية<small>The Limit Concept</small></h2></div>
            <div className="analogy">
              <div className="albl">🚶 تشبيه الاقتراب</div>
              <p>تمشي نحو جدار وكل خطوة تقطع نصف المسافة المتبقية. لن تصل أبداً لكنك تقترب أكثر وأكثر. النهاية تسأل: «ماذا تقترب منه؟» وليس «هل وصلت؟». النهاية تهتم بالسلوك <strong>قرب</strong> النقطة لا <strong>عند</strong> النقطة.</p>
            </div>
            <div className="fml big">lim<sub>x→a</sub> f(x) = L</div>
            <div className="flbl">«نهاية f(x) عندما x تقترب من a تساوي L»</div>
            <div className="con">
              <h4>📌 التعريف الدقيق (ε-δ)</h4>
              <p>لكل ε &gt; 0 يوجد δ &gt; 0 بحيث: إذا كان 0 &lt; |x-a| &lt; δ فإن |f(x)-L| &lt; ε</p>
              <p style={{marginTop:'8px'}}>بمعنى بسيط: يمكن جعل f(x) قريبة من L بقدر ما نشاء بجعل x قريبة كافياً من a</p>
            </div>

            <h3>الحالات الستة الشائعة</h3>
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(47,208,158,0.15)',color:'var(--green)'}}>حالة 1</span><h4>التعويض المباشر</h4></div>
                <p>الدالة متصلة عند النقطة — عوّض مباشرة</p>
                <div className="fml gr" style={{fontSize:'13px'}}>lim<sub>x→3</sub>(x²+1) = 3²+1 = 10 ✓</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(245,185,62,0.15)',color:'var(--gold)'}}>حالة 2</span><h4>الشكل 0/0</h4></div>
                <p>يلزم تبسيط: تحليل، ضرب بالمرافق، أو لوبيتال</p>
                <div className="fml g" style={{fontSize:'13px'}}>lim(x²-4)/(x-2) → حلّل → lim(x+2)=4</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>حالة 3</span><h4>الشكل ∞/∞</h4></div>
                <p>اقسم على أعلى قوة في المقام</p>
                <div className="fml p" style={{fontSize:'13px'}}>lim(3x²+1)/(x²-2) = 3/1 = 3</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(155,119,243,0.15)',color:'var(--purple)'}}>حالة 4</span><h4>النهايات اللانهائية</h4></div>
                <p>x→±∞ أو f→±∞</p>
                <div className="fml pp" style={{fontSize:'13px'}}>lim<sub>x→∞</sub> 1/xⁿ = 0 (n &gt; 0)</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(56,182,240,0.15)',color:'var(--blue)'}}>حالة 5</span><h4>الحدود الجانبية</h4></div>
                <p>النهاية موجودة ⟺ الجانبيان متساويان</p>
                <div className="fml" style={{fontSize:'12px'}}>lim<sub>x→a⁺</sub>f = lim<sub>x→a⁻</sub>f</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,104,172,0.15)',color:'var(--pink)'}}>حالة 6</span><h4>الأشكال 0·∞ و ∞-∞</h4></div>
                <p>حوّل لـ 0/0 أو ∞/∞ ثم لوبيتال</p>
                <div className="fml p" style={{fontSize:'12px'}}>0·∞ → f/(1/g) | ∞-∞ → اضرب بالمرافق</div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>تقنيات حل النهايات<small>Evaluation Techniques</small></h2></div>

            <h3>أولاً: التحليل والاختصار</h3>
            <div className="ex">
              <div className="exlbl">✏️ مثال كامل</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>المسألة:</strong> lim<sub>x→-3</sub> (x²+x-6)/(x²-9)</p></div>
                <div className="step"><div className="snum">2</div><p>التعويض: 0/0 ← نحلّل</p></div>
                <div className="step"><div className="snum">3</div><p>البسط: x²+x-6 = (x+3)(x-2)</p></div>
                <div className="step"><div className="snum">4</div><p>المقام: x²-9 = (x+3)(x-3)</p></div>
                <div className="step"><div className="snum">5</div><p>نختصر (x+3): lim(x-2)/(x-3) = (-3-2)/(-3-3) = (-5)/(-6) = <strong>5/6</strong></p></div>
              </div>
            </div>

            <h3>ثانياً: الضرب بالمرافق</h3>
            <div className="con">
              <h4>📌 متى نستخدمه؟</h4>
              <p>عندما يوجد جذر تربيعي في البسط أو المقام وتحصل على 0/0</p>
            </div>
            <div className="ex">
              <div className="exlbl">✏️ مثال: lim<sub>x→0</sub> (√(x+4) - 2)/x</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>0/0 ← نضرب ونقسم بالمرافق (√(x+4) + 2)</p></div>
                <div className="step"><div className="snum">2</div><p>البسط: (x+4-4) = x | المقام: x(√(x+4)+2)</p></div>
                <div className="step"><div className="snum">3</div><p>نختصر x: lim 1/(√(x+4)+2) = 1/(2+2) = <strong>1/4</strong></p></div>
              </div>
            </div>

            <h3>ثالثاً: قاعدة لوبيتال — شرح كامل</h3>
            <div className="con g">
              <h4>⚠️ شروط التطبيق الدقيقة</h4>
              <ul>
                <li>الشكل يجب أن يكون <strong>بالضبط</strong> 0/0 أو ∞/∞ قبل التطبيق</li>
                <li>تُشتق f و g كل منهما <strong>على حدة</strong> — لا تستخدم قاعدة القسمة!</li>
                <li>إذا أعطى التطبيق شكلاً غير محدداً مرة أخرى، طبّق لوبيتال مجدداً</li>
                <li>إذا كان L=0 وليس 0/0 أو ∞/∞ — <strong>لا</strong> تستخدم لوبيتال</li>
              </ul>
            </div>
            <div className="fml g big">lim f/g = 0/0 أو ∞/∞ ⟹ lim f&apos;(x)/g&apos;(x)</div>
            <div className="ex">
              <div className="exlbl">✏️ مثال 1: lim<sub>x→0</sub> (sin x - x)/x³</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>التعويض: 0/0 ← لوبيتال أول</p></div>
                <div className="step"><div className="snum">2</div><p>lim (cos x - 1)/(3x²) = 0/0 ← لوبيتال ثاني</p></div>
                <div className="step"><div className="snum">3</div><p>lim (-sin x)/(6x) = 0/0 ← لوبيتال ثالث</p></div>
                <div className="step"><div className="snum">4</div><p>lim (-cos x)/6 = -1/6 ← <strong>النتيجة: -1/6</strong></p></div>
              </div>
            </div>

            <h3>رابعاً: الأشكال الخاصة 1^∞ و 0^0 و ∞^0</h3>
            <div className="fml pp">L = lim [f(x)]^g(x) → ln L = lim g(x)·ln[f(x)] → نحل → L = e^(النتيجة)</div>
            <div className="ex">
              <div className="exlbl">✏️ الشكل 1^∞ : lim<sub>x→∞</sub> (1 + 1/x)^x = e</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>نعرّف L = النهاية ← ln L = lim x·ln(1+1/x)</p></div>
                <div className="step"><div className="snum">2</div><p>= lim ln(1+1/x) / (1/x) ← الشكل 0/0 ← لوبيتال</p></div>
                <div className="step"><div className="snum">3</div><p>بعد الحساب: ln L = 1 ← <strong>L = e ✓</strong></p></div>
              </div>
            </div>

            <h3>خامساً: نهايات x→∞ — قواعد الدرجات</h3>
            <table className="tbl">
              <tbody>
                <tr><th>الحالة</th><th>الشرط</th><th>النهاية</th><th>مثال</th></tr>
                <tr><td>deg(f) = deg(g)</td><td className="c">المعاملات الرائدة</td><td className="cv">= a/b</td><td className="cv">lim (3x²)/(5x²) = 3/5</td></tr>
                <tr><td>deg(f) &lt; deg(g)</td><td className="c">—</td><td className="cv">= 0</td><td className="cv">lim (x)/(x³) = 0</td></tr>
                <tr><td>deg(f) &gt; deg(g)</td><td className="c">—</td><td className="cv">= ±∞</td><td className="cv">lim (x⁴)/(x²) = ∞</td></tr>
              </tbody>
            </table>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>الحدود الجانبية والتقاربات<small>One-Sided Limits & Asymptotes</small></h2></div>
            <div className="fml">lim<sub>x→a⁺</sub> f(x) : النهاية من اليمين (x &gt; a)</div>
            <div className="fml p">lim<sub>x→a⁻</sub> f(x) : النهاية من اليسار (x &lt; a)</div>
            <div className="fml pp big">النهاية الثنائية موجودة ⟺ النهايتان الجانبيتان موجودتان ومتساويتان</div>
            
            <h3>التقاربات — Asymptotes</h3>
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>رأسية</span></div>
                <p>x = a تقارب رأسي إذا كانت النهاية من اليمين أو اليسار = ±∞</p>
                <div className="fml p" style={{fontSize:'12.5px'}}>مثال: y=1/x — تقارب رأسي x=0</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(56,182,240,0.15)',color:'var(--blue)'}}>أفقية</span></div>
                <p>y = L تقارب أفقي إذا كان lim<sub>x→±∞</sub> f(x) = L</p>
                <div className="fml" style={{fontSize:'12.5px'}}>مثال: y=1/x — تقارب أفقي y=0</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(47,208,158,0.15)',color:'var(--green)'}}>مائلة</span></div>
                <p>y = mx+b تقارب مائل عندما deg(f) = deg(g) + 1</p>
                <div className="fml gr" style={{fontSize:'12.5px'}}>m = lim f(x)/x ، b = lim[f(x)-mx]</div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">4</div><h2>النهايات الأساسية المهمة<small>Must-Know Limits</small></h2></div>
            <div className="fgrid">
              <div className="fc gr"><div className="fn">sinθ/θ عند θ→0</div><div className="fe">= 1 ⭐</div></div>
              <div className="fc p"><div className="fn">(1-cosθ)/θ عند θ→0</div><div className="fe">= 0</div></div>
              <div className="fc pp"><div className="fn">tanθ/θ عند θ→0</div><div className="fe">= 1</div></div>
              <div className="fc g"><div className="fn">(eˣ-1)/x عند x→0</div><div className="fe">= 1</div></div>
              <div className="fc"><div className="fn">(1+x)^(1/x) عند x→0</div><div className="fe">= e</div></div>
              <div className="fc p"><div className="fn">(1+1/x)^x عند x→∞</div><div className="fe">= e</div></div>
              <div className="fc gr"><div className="fn">ln(1+x)/x عند x→0</div><div className="fe">= 1</div></div>
              <div className="fc pp"><div className="fn">1/xᵖ عند x→∞ (p&gt;0)</div><div className="fe">= 0</div></div>
            </div>

            <h3>مبرهنة الحصار (Squeeze Theorem)</h3>
            <div className="fml">g(x) ≤ f(x) ≤ h(x) قرب a ، و lim g = lim h = L ⟹ lim f = L</div>
            <div className="ex">
              <div className="exlbl">✏️ مثال كلاسيكي: lim<sub>x→0</sub> x·sin(1/x)</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>دائماً: -1 ≤ sin(1/x) ≤ 1</p></div>
                <div className="step"><div className="snum">2</div><p>نضرب في |x|: -|x| ≤ x·sin(1/x) ≤ |x|</p></div>
                <div className="step"><div className="snum">3</div><p>lim|x|=0 ← بالحصار: <strong>النهاية = 0 ✓</strong></p></div>
              </div>
            </div>
          </div>

          <div className="quiz">
            <div className="qt2">🎯 اختبر نفسك — النهايات</div>
            <div className="qb">
              <div className="qq">lim<sub>x→0</sub> (sin 5x)/(sin 3x) = ?</div>
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

        {/* PAGE 2: CONTINUITY */}
        <div id="p2" className={`pg ${currentPage === 'p2' ? 'on' : ''}`}>
          <div className="pt">〰️ <span className="hl">الاستمرارية</span></div>
          <div className="ps">متى الدالة «بلا قفزات»؟ الشروط والأنواع والمبرهنات</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>تعريف الاستمرارية<small>Continuity at a Point</small></h2></div>
            <div className="analogy">
              <div className="albl">✏️ تشبيه الرسم</div>
              <p>الدالة المتصلة ترسمها دون رفع القلم عن الورقة. أي فجوة أو قفزة أو منحنى يقطع = انقطاع.</p>
            </div>
            <div className="con">
              <h4>✅ الشروط الثلاثة — يجب توافر الثلاثة معاً</h4>
              <ol>
                <li><strong>f(a) موجودة</strong> — النقطة معرَّفة (ليست ∞ أو غير محددة)</li>
                <li><strong>lim<sub>x→a</sub> f(x) موجودة</strong> — الجانبيان متساويان</li>
                <li><strong>lim<sub>x→a</sub> f(x) = f(a)</strong> — النهاية تساوي قيمة الدالة</li>
              </ol>
            </div>
            <div className="fml big">f متصلة عند a ⟺ lim<sub>x→a</sub> f(x) = f(a)</div>

            <h3>أنواع الانقطاع الثلاثة</h3>
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(47,208,158,0.15)',color:'var(--green)'}}>النوع 1</span><h4>الانقطاع القابل للإزالة</h4></div>
                <p>النهاية موجودة لكن f(a) إما غير معرّفة أو تختلف عن النهاية.</p>
                <div className="fml gr" style={{fontSize:'12.5px'}}>f(x)=(x²-1)/(x-1) — ثقب عند x=1</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(245,185,62,0.15)',color:'var(--gold)'}}>النوع 2</span><h4>الانقطاع القفزي</h4></div>
                <p>الجانبيان موجودان لكنهما مختلفان. يظهر في الدوال المعرّفة بشرط.</p>
                <div className="fml g" style={{fontSize:'12.5px'}}>f(x)=⌊x⌋ عند الأعداد الصحيحة</div>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>النوع 3</span><h4>الانقطاع اللانهائي</h4></div>
                <p>النهاية = ±∞ . يحدث عند القسمة على صفر. يُنشئ تقارباً رأسياً.</p>
                <div className="fml p" style={{fontSize:'12.5px'}}>f(x)=1/x عند x=0 → ∞</div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>مبرهنة القيمة الوسطى (IVT)<small>Intermediate Value Theorem</small></h2></div>
            <div className="con gr">
              <h4>📌 النص الرسمي</h4>
              <p>إذا كانت f متصلة على [a,b] وكانت k عدداً بين f(a) و f(b)، فيوجد على الأقل c ∈ (a,b) بحيث f(c) = k.</p>
            </div>
            <div className="ex">
              <div className="exlbl">✏️ تطبيق: أثبت أن f(x) = x³ + x - 1 لها جذر في (0,1)</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>f متصلة (كثيرة حدود) ✓</p></div>
                <div className="step"><div className="snum">2</div><p>f(0) = -1 &lt; 0 | f(1) = 1 &gt; 0</p></div>
                <div className="step"><div className="snum">3</div><p>0 بين f(0) و f(1) ← بـ IVT: يوجد c ∈ (0,1): f(c) = 0 ✓</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 3: DERIVATIVES */}
        <div id="p3" className={`pg ${currentPage === 'p3' ? 'on' : ''}`}>
          <div className="pt">📈 <span className="hl">المشتقات</span></div>
          <div className="ps">من التعريف إلى كل القواعد — مع شرح كامل لكل حالة</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>مفهوم المشتقة<small>The Derivative</small></h2></div>
            <div className="analogy">
              <div className="albl">🚗 تشبيه السيارة</div>
              <p>إذا كان s(t) موقعك على الطريق لحظة بلحظة، فـ s&apos;(t) هي سرعتك اللحظية تماماً كما يُظهرها العداد. المشتقة = معدل التغير اللحظي = ميل المماس للمنحنى.</p>
            </div>
            <div className="fml big">f&apos;(x) = lim<sub>h→0</sub> [f(x+h) − f(x)] / h</div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>جدول المشتقات الكامل<small>All Derivatives</small></h2></div>
            <div className="fml big">d/dx (xⁿ) = n·xⁿ⁻¹</div>
            <table className="tbl">
              <tbody>
                <tr><th>الدالة f(x)</th><th>المشتقة f&apos;(x)</th><th>ملاحظة</th></tr>
                <tr><td>c (ثابت)</td><td className="c">0</td><td style={{color:'var(--muted)'}}>—</td></tr>
                <tr><td>xⁿ</td><td className="c">n·xⁿ⁻¹</td><td style={{color:'var(--muted)'}}>لكل n</td></tr>
                <tr><td>sin x</td><td className="c">cos x</td><td style={{color:'var(--muted)'}}>—</td></tr>
                <tr><td>cos x</td><td className="c">−sin x</td><td style={{color:'var(--muted)'}}>⚠️ السالب!</td></tr>
                <tr><td>tan x</td><td className="c">sec²x</td><td style={{color:'var(--muted)'}}>—</td></tr>
                <tr><td>eˣ</td><td className="c">eˣ</td><td style={{color:'var(--muted)'}}>🤯 تساوي نفسها!</td></tr>
                <tr><td>ln x</td><td className="c">1/x</td><td style={{color:'var(--muted)'}}>x &gt; 0</td></tr>
                <tr><td>sin⁻¹x</td><td className="c">1/√(1-x²)</td><td style={{color:'var(--muted)'}}>|x| &lt; 1</td></tr>
                <tr><td>tan⁻¹x</td><td className="c">1/(1+x²)</td><td style={{color:'var(--muted)'}}>—</td></tr>
              </tbody>
            </table>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>قواعد الاشتقاق كاملة<small>Differentiation Rules</small></h2></div>

            <h3>قاعدة الضرب</h3>
            <div className="fml p big">(f·g)&apos; = f&apos;g + fg&apos;</div>
            
            <h3>قاعدة القسمة</h3>
            <div className="fml g big">(f/g)&apos; = (g·f&apos; − f·g&apos;) / g²</div>

            <h3>قاعدة السلسلة — الأهم!</h3>
            <div className="fml pp big">[f(g(x))]&apos; = f&apos;(g(x)) · g&apos;(x)</div>
            <div className="ex">
              <div className="exlbl">✏️ أمثلة متدرجة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>d/dx[sin(x²)] = cos(x²)·2x</p></div>
                <div className="step"><div className="snum">2</div><p>d/dx[e^(3x)] = 3e^(3x)</p></div>
                <div className="step"><div className="snum">3</div><p>d/dx[ln(x²+1)] = 2x/(x²+1)</p></div>
              </div>
            </div>

            <h3>الاشتقاق الضمني</h3>
            <div className="ex">
              <div className="exlbl">✏️ مثال: x²+y²=25 جد y&apos;</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>نشتق: 2x + 2y·y&apos; = 0</p></div>
                <div className="step"><div className="snum">2</div><p>y&apos; = <strong>-x/y</strong></p></div>
              </div>
            </div>

            <h3>الاشتقاق اللوغاريتمي</h3>
            <div className="con gr">
              <h4>📌 متى نستخدمه؟</h4>
              <ul>
                <li>المتغير في الأس والقاعدة معاً: y = x^x</li>
                <li>ضرب/قسمة دوال كثيرة</li>
              </ul>
            </div>
            <div className="ex">
              <div className="exlbl">✏️ مثال: y = x^x</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>ln y = x·ln x</p></div>
                <div className="step"><div className="snum">2</div><p>y&apos;/y = ln x + 1</p></div>
                <div className="step"><div className="snum">3</div><p>y&apos; = <strong>xˣ(ln x + 1)</strong></p></div>
              </div>
            </div>
          </div>

          <div className="quiz">
            <div className="qt2">🎯 اختبر نفسك — المشتقات</div>
            <div className="qb">
              <div className="qq">d/dx [ x³·cos(x) ] = ?</div>
              <div className="qo">
                <button className="qbtn" onClick={(e) => handleQuiz('qd1', false, e.currentTarget)}>3x²·(-sin x)</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qd1', true, e.currentTarget)}>3x²·cos x − x³·sin x</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qd1', false, e.currentTarget)}>3x²·cos x + x³·sin x</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qd1', false, e.currentTarget)}>−x³·sin x</button>
              </div>
              <div className="qr" id="qd1r"></div>
            </div>
          </div>
        </div>

        {/* PAGE 4: DERIVATIVE APPLICATIONS */}
        <div id="p4" className={`pg ${currentPage === 'p4' ? 'on' : ''}`}>
          <div className="pt">🎯 <span className="hl">تطبيقات المشتقة</span></div>
          <div className="ps">من خط المماس إلى التحسين — كل تطبيقات الحياة الحقيقية</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>خط المماس وخط العمود<small>Tangent & Normal Lines</small></h2></div>
            <div className="fml">المماس: y − f(a) = f&apos;(a)·(x − a)</div>
            <div className="fml p">العمود: ميله = −1/f&apos;(a)</div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>القيم العظمى والصغرى<small>Extrema</small></h2></div>
            
            <h3>الاختبار الأول</h3>
            <table className="tbl">
              <tbody>
                <tr><th>إشارة f&apos; قبل c</th><th>إشارة f&apos; بعد c</th><th>النوع</th></tr>
                <tr><td style={{color:'var(--green)'}}>+ </td><td style={{color:'var(--red)'}}>- </td><td style={{color:'var(--gold)'}}>عظمى محلية</td></tr>
                <tr><td style={{color:'var(--red)'}}>- </td><td style={{color:'var(--green)'}}>+ </td><td style={{color:'var(--blue)'}}>صغرى محلية</td></tr>
              </tbody>
            </table>

            <h3>الاختبار الثاني — المشتقة الثانية</h3>
            <div className="fml">f&apos;(c)=0: f&apos;&apos;(c)&gt;0 → صغرى | f&apos;&apos;(c)&lt;0 → عظمى</div>

            <h3>التحدب والتقعر</h3>
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(47,208,158,0.15)',color:'var(--green)'}}>محدب لأعلى</span></div>
                <p>f&apos;&apos; &gt; 0 — الدالة تشبه الكأس ∪</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,104,172,0.15)',color:'var(--pink)'}}>محدب لأسفل</span></div>
                <p>f&apos;&apos; &lt; 0 — الدالة تشبه القبة ∩</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(155,119,243,0.15)',color:'var(--purple)'}}>نقطة انعطاف</span></div>
                <p>حيث يتغير التحدب — f&apos;&apos;=0 مع تغيير الإشارة</p>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>مسائل التحسين<small>Optimization</small></h2></div>
            <div className="con g">
              <h4>📌 خطوات الحل</h4>
              <ol>
                <li>ارسم الشكل وسمّ المتغيرات</li>
                <li>اكتب دالة الهدف</li>
                <li>اكتب القيد وحلّ منه لمتغير واحد</li>
                <li>عوّض في دالة الهدف</li>
                <li>اشتق واجعل المشتقة = 0</li>
                <li>تحقق أن النتيجة عظمى أو صغرى</li>
              </ol>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">4</div><h2>مبرهنة القيمة الوسطى (MVT)<small>Mean Value Theorem</small></h2></div>
            <div className="fml big">f متصلة [a,b]، قابلة للاشتقاق (a,b) ⟹ ∃c: f&apos;(c) = [f(b)-f(a)]/(b-a)</div>
            <div className="analogy">
              <div className="albl">🚗 تفسير MVT</div>
              <p>إذا قطعت 300 كم في 3 ساعات (معدل 100 كم/ساعة)، فلا بد أن سرعتك كانت بالضبط 100 كم/ساعة في لحظة ما!</p>
            </div>
          </div>
        </div>

        {/* PAGE 5: INTEGRALS */}
        <div id="p5" className={`pg ${currentPage === 'p5' ? 'on' : ''}`}>
          <div className="pt">∫ <span className="hl">التكامل</span></div>
          <div className="ps">من مجموع ريمان إلى المبرهنة الأساسية وكل التكاملات الأساسية</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>المبرهنة الأساسية للتكامل<small>Fundamental Theorem</small></h2></div>
            <div className="note i"><div className="nic">⭐</div><p><strong>أعظم اكتشاف في تاريخ الرياضيات!</strong></p></div>
            <div className="fml big">∫ₐᵇ f(x)dx = F(b) − F(a)</div>
            <div className="fml p">d/dx [∫ₐˣ f(t)dt] = f(x)</div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>جدول التكاملات الكامل<small>Standard Integrals</small></h2></div>
            <table className="tbl">
              <tbody>
                <tr><th>الدالة</th><th>∫f(x)dx</th></tr>
                <tr><td>xⁿ (n≠-1)</td><td className="c">xⁿ⁺¹/(n+1) + C</td></tr>
                <tr><td>1/x</td><td className="c">ln|x| + C</td></tr>
                <tr><td>eˣ</td><td className="c">eˣ + C</td></tr>
                <tr><td>sin x</td><td className="c">−cos x + C</td></tr>
                <tr><td>cos x</td><td className="c">sin x + C</td></tr>
                <tr><td>sec²x</td><td className="c">tan x + C</td></tr>
                <tr><td>1/(1+x²)</td><td className="c">tan⁻¹x + C</td></tr>
                <tr><td>1/√(1-x²)</td><td className="c">sin⁻¹x + C</td></tr>
              </tbody>
            </table>
          </div>

          <div className="quiz">
            <div className="qt2">🎯 اختبر نفسك — التكامل</div>
            <div className="qb">
              <div className="qq">∫ (5x⁴ − 3/x² + 2) dx = ?</div>
              <div className="qo">
                <button className="qbtn" onClick={(e) => handleQuiz('qi1', true, e.currentTarget)}>x⁵ + 3/x + 2x + C</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qi1', false, e.currentTarget)}>5x⁵ − 3/x + 2x + C</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qi1', false, e.currentTarget)}>x⁵ + 3x⁻³ + 2x + C</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qi1', false, e.currentTarget)}>20x³ − 6/x³ + C</button>
              </div>
              <div className="qr" id="qi1r"></div>
            </div>
          </div>
        </div>

        {/* PAGE 6: INTEGRATION TECHNIQUES */}
        <div id="p6" className={`pg ${currentPage === 'p6' ? 'on' : ''}`}>
          <div className="pt">🔧 <span className="hl">تقنيات التكامل</span></div>
          <div className="ps">كل طريقة بشرح كامل — متى تستخدمها، كيف تُتقنها</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>التكامل بالتعويض (u-Sub)<small>Substitution</small></h2></div>
            <div className="fml big">∫ f(g(x))·g&apos;(x) dx = ∫ f(u) du</div>
            <div className="ex">
              <div className="exlbl">✏️ مثال: ∫ 2x·e^(x²) dx</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>u = x² → du = 2x dx</p></div>
                <div className="step"><div className="snum">2</div><p>= <strong>e^(x²) + C</strong></p></div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>التكامل بالتجزئة (IBP)<small>Integration by Parts</small></h2></div>
            <div className="fml big">∫ u dv = uv − ∫ v du</div>
            <div className="con g">
              <h4>🔑 قاعدة LIATE لاختيار u</h4>
              <ul>
                <li><strong>L</strong> — Logarithmic</li>
                <li><strong>I</strong> — Inverse Trig</li>
                <li><strong>A</strong> — Algebraic</li>
                <li><strong>T</strong> — Trigonometric</li>
                <li><strong>E</strong> — Exponential</li>
              </ul>
            </div>
            <div className="ex">
              <div className="exlbl">✏️ مثال: ∫ x·sin(x) dx</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>u=x, dv=sinx dx</p></div>
                <div className="step"><div className="snum">2</div><p>= <strong>sinx − x·cosx + C</strong></p></div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>التعويض المثلثي<small>Trig Substitution</small></h2></div>
            <table className="tbl">
              <tbody>
                <tr><th>التعبير</th><th>التعويض</th></tr>
                <tr><td className="c">√(a²−x²)</td><td className="c">x = a·sinθ</td></tr>
                <tr><td className="c">√(a²+x²)</td><td className="c">x = a·tanθ</td></tr>
                <tr><td className="c">√(x²−a²)</td><td className="c">x = a·secθ</td></tr>
              </tbody>
            </table>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">4</div><h2>الكسور الجزئية<small>Partial Fractions</small></h2></div>
            <div className="fml gr">P(x)/[(x-a)(x-b)] = A/(x-a) + B/(x-b)</div>
            <div className="note w"><div className="nic">⚠️</div><p>درجة البسط يجب أن تكون أقل من درجة المقام!</p></div>
          </div>
        </div>

        {/* PAGE 7: INTEGRATION APPLICATIONS */}
        <div id="p7" className={`pg ${currentPage === 'p7' ? 'on' : ''}`}>
          <div className="pt">📏 <span className="hl">تطبيقات التكامل</span></div>
          <div className="ps">المساحات والحجوم وطول القوس — مع مسائل "غريبة" ومثيرة! 🎯</div>

          {/* القسم 1: المساحة بين منحنيات */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>المساحة بين منحنيين<small>Area Between Curves</small></h2></div>
            
            <div className="analogy">
              <div className="albl">🎨 الفكرة ببساطة</div>
              <p>تخيل أن عندك قطعتين من الورق فوق بعضهما. المساحة بين المنحنيين = المساحة الموجودة بينهما فقط. نطرح المساحة الصغرى من الكبرى!</p>
            </div>
            
            <div className="fml big">A = ∫ₐᵇ |الأعلى − الأدنى| dx</div>
            
            <div className="con g">
              <h4>📋 الخطوات الأربع السحرية</h4>
              <ol>
                <li><strong>ارسم</strong> — رسم المنحنيين يوضح أيهما أعلى</li>
                <li><strong>جد التقاطعات</strong> — حل f(x) = g(x) لإيجاد حدود التكامل</li>
                <li><strong>حدد الأعلى والأدنى</strong> — اختبر نقطة بين التقاطعات</li>
                <li><strong>اكتب التكامل</strong> — ∫(الأعلى − الأدنى) dx</li>
              </ol>
            </div>

            <h3>✏️ مثال 1: مساحة بسيطة</h3>
            <div className="ex">
              <div className="exlbl">المسألة: جد المساحة المحصورة بين y = x² و y = x</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>الرسم الذهني:</strong> x² هي قطع مكافئ يفتح لأعلى، x هو خط مستقيم</p></div>
                <div className="step"><div className="snum">2</div><p><strong>التقاطع:</strong> x² = x ← x² − x = 0 ← x(x−1) = 0 ← x = 0, 1</p></div>
                <div className="step"><div className="snum">3</div><p><strong>من الأعلى؟</strong> اختبر x = 0.5: (0.5)² = 0.25 و 0.5 = 0.5 ← x أعلى من x²</p></div>
                <div className="step"><div className="snum">4</div><p><strong>التكامل:</strong> A = ∫₀¹ (x − x²) dx</p></div>
                <div className="step"><div className="snum">5</div><p>A = [x²/2 − x³/3]₀¹ = (1/2 − 1/3) − 0 = <strong>1/6 وحدة مربعة ✓</strong></p></div>
              </div>
            </div>

            <h3>🎯 مثال 2: مساحة مثلث "غريبة"!</h3>
            <div className="ex">
              <div className="exlbl">المسألة: جد مساحة المثلث المحدد بالنقاط (0,0)، (2,2)، (4,0)</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>جد معادلات الخطوط:</strong></p></div>
                <div className="step"><div className="snum">2</div><p>الخط من (0,0) إلى (2,2): الميل = 1 ← y = x</p></div>
                <div className="step"><div className="snum">3</div><p>الخط من (2,2) إلى (4,0): الميل = (0-2)/(4-2) = −1 ← y = −x + 4</p></div>
                <div className="step"><div className="snum">4</div><p><strong>قسّم المساحة:</strong> من x=0 إلى x=2: تحت y=x ومن x=2 إلى x=4: تحت y=−x+4</p></div>
                <div className="step"><div className="snum">5</div><p>A = ∫₀² x dx + ∫₂⁴ (−x+4) dx</p></div>
                <div className="step"><div className="snum">6</div><p>A = [x²/2]₀² + [−x²/2 + 4x]₂⁴ = 2 + (−8+16 − (−2+8)) = 2 + 2 = <strong>4 وحدات مربعة ✓</strong></p></div>
              </div>
            </div>

            <h3>🔥 مثال 3: مسألة "غريبة" حقاً!</h3>
            <div className="ex">
              <div className="exlbl">المسألة: جد المساحة المحصورة بين y = sin(x) و y = cos(x) من x=0 إلى x=π/2</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>التقاطع:</strong> sin(x) = cos(x) ← tan(x) = 1 ← x = π/4</p></div>
                <div className="step"><div className="snum">2</div><p><strong>من الأعلى في [0, π/4]؟</strong> اختبر x=0.1: sin(0.1)≈0.1, cos(0.1)≈0.995 ← cos أعلى</p></div>
                <div className="step"><div className="snum">3</div><p><strong>من الأعلى في [π/4, π/2]؟</strong> اختبر x=1: sin(1)≈0.84, cos(1)≈0.54 ← sin أعلى</p></div>
                <div className="step"><div className="snum">4</div><p>A = ∫₀^(π/4) (cos x − sin x) dx + ∫_(π/4)^(π/2) (sin x − cos x) dx</p></div>
                <div className="step"><div className="snum">5</div><p>A = [sin x + cos x]₀^(π/4) + [−cos x − sin x]_(π/4)^(π/2)</p></div>
                <div className="step"><div className="snum">6</div><p>A = (√2/2 + √2/2 − 1) + (−0 − 1 + √2/2 + √2/2) = <strong>2√2 − 2 ≈ 0.83 وحدة مربعة ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* القسم 2: الحجوم بالتدوير */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>الحجوم بالتدوير — شرح عميق<small>Volumes of Revolution</small></h2></div>
            
            <div className="analogy">
              <div className="albl">🏺 الفكرة ببساطة</div>
              <p>تخيل أنك تلف ورقة على قلم رصاص — تحصل على أسطوانة! كذلك عندما تدوير منحنى حول محور، تحصل على شكل ثلاثي الأبعاد. حجم هذا الشكل نحسبه بالتكامل.</p>
            </div>

            <h3>🔹 طريقة القرص (Disk Method)</h3>
            <div className="con">
              <h4>متى نستخدمها؟</h4>
              <p>عندما يكون المنحنى ملاصقاً للمحور الذي ندور حوله (لا يوجد فراغ في المنتصف)</p>
            </div>
            <div className="fml gr big">V = π ∫ₐᵇ [R(x)]² dx</div>
            <div className="flbl">R(x) = نصف القطر = المسافة من المحور إلى المنحنى</div>
            
            <div className="ex">
              <div className="exlbl">✏️ مثال: جد حجم الجسم الناتج من تدوير y = √x حول محور x من x=0 إلى x=4</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>تخيل:</strong> عندما نلف y=√x حول محور x، نحصل على شكل يشبه "الآيس كريم"</p></div>
                <div className="step"><div className="snum">2</div><p>R(x) = √x (المسافة من المحور للمنحنى)</p></div>
                <div className="step"><div className="snum">3</div><p>V = π ∫₀⁴ (√x)² dx = π ∫₀⁴ x dx</p></div>
                <div className="step"><div className="snum">4</div><p>V = π [x²/2]₀⁴ = π · 8 = <strong>8π وحدة مكعبة ✓</strong></p></div>
              </div>
            </div>

            <h3>🔹 طريقة الغسّالة (Washer Method)</h3>
            <div className="con pp">
              <h4>متى نستخدمها؟</h4>
              <p>عندما يكون هناك "فراغ" في المنتصف — مثل الدونات! لدينا نصف قطر خارجي R ونصف قطر داخلي r</p>
            </div>
            <div className="fml p big">V = π ∫ₐᵇ ([R(x)]² − [r(x)]²) dx</div>
            
            <div className="ex">
              <div className="exlbl">✏️ مثال "غريب": جد حجم الجسم الناتج من تدوير المنطقة بين y=x² و y=x حول محور x</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>التقاطع:</strong> x² = x ← x = 0, 1</p></div>
                <div className="step"><div className="snum">2</div><p><strong>الرسم:</strong> في [0,1]: y=x أعلى من y=x²</p></div>
                <div className="step"><div className="snum">3</div><p><strong>نصف القطر الخارجي:</strong> R = x (الأبعد عن المحور)</p></div>
                <div className="step"><div className="snum">4</div><p><strong>نصف القطر الداخلي:</strong> r = x² (الأقرب للمحور)</p></div>
                <div className="step"><div className="snum">5</div><p>V = π ∫₀¹ (x² − x⁴) dx</p></div>
                <div className="step"><div className="snum">6</div><p>V = π [x³/3 − x⁵/5]₀¹ = π(1/3 − 1/5) = <strong>2π/15 وحدة مكعبة ✓</strong></p></div>
              </div>
            </div>

            <h3>🔹 طريقة الأغلفة (Shell Method)</h3>
            <div className="con g">
              <h4>متى نستخدمها؟</h4>
              <p>عندما ندور حول محور y ونريد استخدام x كمتغير — أو عندما تكون القرص/الغسالة صعبة!</p>
            </div>
            <div className="fml pp big">V = 2π ∫ₐᵇ (نصف القطر) × (الارتفاع) dx</div>
            
            <div className="ex">
              <div className="exlbl">✏️ مثال: جد حجم الجسم الناتج من تدوير y = x² من x=0 إلى x=2 حول محور y</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>لماذا Shell وليس Disk؟</strong> لأننا ندور حول y ولدينا y بدلالة x</p></div>
                <div className="step"><div className="snum">2</div><p><strong>نصف القطر:</strong> المسافة من محور y = x</p></div>
                <div className="step"><div className="snum">3</div><p><strong>الارتفاع:</strong> y = x²</p></div>
                <div className="step"><div className="snum">4</div><p>V = 2π ∫₀² x · x² dx = 2π ∫₀² x³ dx</p></div>
                <div className="step"><div className="snum">5</div><p>V = 2π [x⁴/4]₀² = 2π · 4 = <strong>8π وحدة مكعبة ✓</strong></p></div>
              </div>
            </div>

            <h3>🔥 مثال "غريب جداً": علبة ذات قعر مدور!</h3>
            <div className="ex">
              <div className="exlbl">المسألة: وعاء اسطواني نصف قطر قاعدته R وارتفاعه H. إذا وضعنا فيه كرة نصف قطرها r، جد حجم الماء المزاح</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>التفكير:</strong> حجم الماء المزاح = حجم الجزء المغمور من الكرة</p></div>
                <div className="step"><div className="snum">2</div><p>معادلة الكرة المتمركزة في الأصل: x² + y² + z² = r²</p></div>
                <div className="step"><div className="snum">3</div><p>نقطع الكرة بمستوى أفقي على ارتفاع h: نحصل على دائرة نصف قطرها √(r² − h²)</p></div>
                <div className="step"><div className="snum">4</div><p>الحجم = ∫₀ʰ π(r² − y²) dy</p></div>
                <div className="step"><div className="snum">5</div><p>= π[r²y − y³/3]₀ʰ = π(r²h − h³/3)</p></div>
                <div className="step"><div className="snum">6</div><p>إذا كانت الكرة مغمورة بالكامل: h = 2r → V = <strong>4πr³/3</strong> (حجم الكرة كاملة!) ✓</p></div>
              </div>
            </div>
          </div>

          {/* القسم 3: طول القوس */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>طول القوس — كم طول هذا المنحنى؟<small>Arc Length</small></h2></div>
            
            <div className="analogy">
              <div className="albl">🛤️ الفكرة</div>
              <p>لو مشيت على منحنى من نقطة A إلى B، كم مشيت؟ لا نقوم بقياس الخط المستقيم بل نقيس طول المنحنى نفسه!</p>
            </div>
            
            <div className="fml big">L = ∫ₐᵇ √(1 + [f&apos;(x)]²) dx</div>
            
            <div className="con g">
              <h4>💡 من أين جاءت هذه الصيغة؟</h4>
              <p>نقسم المنحنى لقطع صغيرة جداً. كل قطعة تقريباً مثلث قائم: القطعة الصغيرة = √(Δx)² + (Δy)². نأخذ النهاية والنهاية!</p>
            </div>

            <div className="ex">
              <div className="exlbl">✏️ مثال: جد طول القوس لـ y = x^(3/2) من x=0 إلى x=4</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>y&apos; = (3/2)x^(1/2)</p></div>
                <div className="step"><div className="snum">2</div><p>1 + (y&apos;)² = 1 + (9/4)x</p></div>
                <div className="step"><div className="snum">3</div><p>L = ∫₀⁴ √(1 + 9x/4) dx</p></div>
                <div className="step"><div className="snum">4</div><p>بعد الحساب: L = <strong>(8/27)(10√10 − 1) ≈ 9.07 وحدات ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* القسم 4: المساحة السطحية */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">4</div><h2>المساحة السطحية للسطح الدوار<small>Surface Area</small></h2></div>
            
            <div className="fml gr big">S = 2π ∫ₐᵇ f(x) √(1 + [f&apos;(x)]²) dx</div>
            <div className="flbl">f(x) = نصف القطر (المسافة من المحور) | الجذر = طول العنصر المنحني</div>
            
            <div className="ex">
              <div className="exlbl">✏️ مثال: جد المساحة السطحية للكرة نصف قطرها r</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>الكرة = تدوير نصف دائرة y = √(r² − x²) حول محور x من −r إلى r</p></div>
                <div className="step"><div className="snum">2</div><p>y&apos; = −x/√(r² − x²)</p></div>
                <div className="step"><div className="snum">3</div><p>1 + (y&apos;)² = r²/(r² − x²)</p></div>
                <div className="step"><div className="snum">4</div><p>S = 2π ∫₋ᵣʳ √(r² − x²) · r/√(r² − x²) dx</p></div>
                <div className="step"><div className="snum">5</div><p>S = 2πr ∫₋ᵣʳ dx = 2πr · 2r = <strong>4πr² ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* ملخص سريع */}
          <div className="note i">
            <div className="nic">📝</div>
            <p><strong>ملخص سريع:</strong> المساحة = ∫|الأعلى − الأدنى| | الحجم بالقرص = π∫R² | الحجم بالغسالة = π∫(R²−r²) | الحجم بالأغلفة = 2π∫(نصف القطر)(الارتفاع)</p>
          </div>

          <div className="quiz">
            <div className="qt2">🎯 اختبر نفسك — تطبيقات التكامل</div>
            <div className="qb">
              <div className="qq">جد المساحة المحصورة بين y = x² و y = 2x</div>
              <div className="qo">
                <button className="qbtn" onClick={(e) => handleQuiz('qapp1', false, e.currentTarget)}>1/3</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qapp1', true, e.currentTarget)}>4/3</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qapp1', false, e.currentTarget)}>2/3</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qapp1', false, e.currentTarget)}>1</button>
              </div>
              <div className="qr" id="qapp1r"></div>
            </div>
          </div>
        </div>

        {/* PAGE 8: SERIES */}
        <div id="p8" className={`pg ${currentPage === 'p8' ? 'on' : ''}`}>
          <div className="pt">∑ <span className="hl">المتسلسلات</span></div>
          <div className="ps">اختبارات التقارب ومتسلسلات تايلور وماكلورين</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>مفهوم المتسلسلات<small>Series Concept</small></h2></div>
            <div className="analogy">
              <div className="albl">💡 الفرق عن المتتاليات</div>
              <p>المتتالية = قائمة أعداد. المتسلسلة = <strong>مجموع</strong> حدود المتتالية. المتسلسلة تتقارب إذا كان مجموع حدودها يقترب من قيمة محددة.</p>
            </div>
            <div className="fml big">Σₙ₌₁^∞ aₙ = a₁ + a₂ + a₃ + ...</div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>المتسلسلة الهندسية<small>Geometric Series</small></h2></div>
            <div className="fml">Σₙ₌₀^∞ arⁿ = a/(1-r) إذا |r| &lt; 1</div>
            <div className="fml p">تتباعد إذا |r| ≥ 1</div>
            <div className="ex">
              <div className="exlbl">✏️ مثال: Σ (1/2)ⁿ = 1 + 1/2 + 1/4 + ...</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>a=1, r=1/2, |r| &lt; 1 ← تتقارب</p></div>
                <div className="step"><div className="snum">2</div><p>المجموع = 1/(1-1/2) = <strong>2</strong></p></div>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>اختبارات التقارب الستة<small>Convergence Tests</small></h2></div>
            
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(56,182,240,0.15)',color:'var(--blue)'}}>اختبار النسبة</span></div>
                <p>L = lim |aₙ₊₁/aₙ|</p>
                <p>L &lt; 1 → تقارب | L &gt; 1 → تباعد</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(47,208,158,0.15)',color:'var(--green)'}}>اختبار الجذر</span></div>
                <p>L = lim ⁿ√|aₙ|</p>
                <p>نفس نتيجة النسبة</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(245,185,62,0.15)',color:'var(--gold)'}}>اختبار المقارنة</span></div>
                <p>0 ≤ aₙ ≤ bₙ و Σbₙ تتقارب → Σaₙ تتقارب</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(155,119,243,0.15)',color:'var(--purple)'}}>اختبار التكامل</span></div>
                <p>∫₁^∞ f(x)dx يتقارب ⟺ Σf(n) يتقارب</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,104,172,0.15)',color:'var(--pink)'}}>اختبار P-متسلسلة</span></div>
                <p>Σ 1/nᵖ تتقارب ⟺ p &gt; 1</p>
                <p>p=1: المتسلسلة التوافقية (تتباعد)</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>اختبار التبادل</span></div>
                <p>Σ(-1)ⁿaₙ تتقارب إذا aₙ متناقصة و lim aₙ = 0</p>
              </div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">4</div><h2>متسلسلات تايلور وماكلورين<small>Taylor & Maclaurin Series</small></h2></div>
            <div className="fml big">f(x) = Σₙ₌₀^∞ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ</div>
            <div className="flbl">ماكلورين = تايلور عند a=0</div>
            
            <h3>متسلسلات ماكلورين المهمة</h3>
            <div className="fgrid">
              <div className="fc"><div className="fn">eˣ</div><div className="fe">Σ xⁿ/n!</div></div>
              <div className="fc p"><div className="fn">sin x</div><div className="fe">Σ (-1)ⁿx²ⁿ⁺¹/(2n+1)!</div></div>
              <div className="fc pp"><div className="fn">cos x</div><div className="fe">Σ (-1)ⁿx²ⁿ/(2n)!</div></div>
              <div className="fc g"><div className="fn">1/(1-x)</div><div className="fe">Σ xⁿ (|x|&lt;1)</div></div>
              <div className="fc gr"><div className="fn">ln(1+x)</div><div className="fe">Σ (-1)ⁿ⁺¹xⁿ/n</div></div>
              <div className="fc"><div className="fn">(1+x)ᵃ</div><div className="fe">Σ C(a,n)xⁿ</div></div>
            </div>
          </div>

          <div className="quiz">
            <div className="qt2">🎯 اختبر نفسك — المتسلسلات</div>
            <div className="qb">
              <div className="qq">Σ 1/n² تتقارب أم تتباعد؟</div>
              <div className="qo">
                <button className="qbtn" onClick={(e) => handleQuiz('qs1', true, e.currentTarget)}>تتقارب (p=2 &gt; 1)</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qs1', false, e.currentTarget)}>تتباعد</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qs1', false, e.currentTarget)}>تعتمد على الشروط</button>
                <button className="qbtn" onClick={(e) => handleQuiz('qs1', false, e.currentTarget)}>لا يمكن تحديده</button>
              </div>
              <div className="qr" id="qs1r"></div>
            </div>
          </div>
        </div>

        {/* PAGE 9: REVIEW */}
        <div id="p9" className={`pg ${currentPage === 'p9' ? 'on' : ''}`}>
          <div className="pt">📋 <span className="hl">المراجعة الشاملة</span></div>
          <div className="ps">ملخص كل المفاهيم والقوانين الأساسية</div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>ملخص القوانين الأساسية<small>Key Formulas Summary</small></h2></div>
            
            <h3>النهايات</h3>
            <div className="fgrid">
              <div className="fc gr"><div className="fn">sinθ/θ → 0</div><div className="fe">= 1</div></div>
              <div className="fc g"><div className="fn">(eˣ-1)/x → 0</div><div className="fe">= 1</div></div>
              <div className="fc pp"><div className="fn">(1+1/x)^x → ∞</div><div className="fe">= e</div></div>
            </div>

            <h3>المشتقات</h3>
            <div className="fgrid">
              <div className="fc"><div className="fn">قاعدة القوة</div><div className="fe">d/dx(xⁿ) = nxⁿ⁻¹</div></div>
              <div className="fc p"><div className="fn">قاعدة السلسلة</div><div className="fe">[f(g)]&apos; = f&apos;(g)·g&apos;</div></div>
              <div className="fc pp"><div className="fn">قاعدة الضرب</div><div className="fe">(fg)&apos; = f&apos;g + fg&apos;</div></div>
            </div>

            <h3>التكامل</h3>
            <div className="fgrid">
              <div className="fc gr"><div className="fn">التعويض</div><div className="fe">u = g(x)</div></div>
              <div className="fc g"><div className="fn">التجزئة</div><div className="fe">∫u dv = uv - ∫v du</div></div>
              <div className="fc"><div className="fn">المبرهنة الأساسية</div><div className="fe">∫ₐᵇf = F(b)-F(a)</div></div>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>نصائح للامتحانات<small>Exam Tips</small></h2></div>
            <div className="con gr">
              <h4>✅ نصائح ذهبية</h4>
              <ol>
                <li><strong>تحديد النوع أولاً:</strong> قبل الحل، حدد نوع المسألة (نهاية، مشتقة، تكامل)</li>
                <li><strong>تحقق من الشروط:</strong> لوبيتال يحتاج 0/0 أو ∞/∞</li>
                <li><strong>ارسم عندما يمكنك:</strong> الرسم يوضح الأفكار</li>
                <li><strong>الوحدات:</strong> لا تنسَ +C في التكامل غير المحدد</li>
                <li><strong>راجع الحدود:</strong> عند التعويض، غيّر حدود التكامل المحدد</li>
              </ol>
            </div>
          </div>

          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>الأخطاء الشائعة<small>Common Mistakes</small></h2></div>
            <div className="cases">
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>❌ خطأ</span><h4>مشطلة المشتقات</h4></div>
                <p>(fg)&apos; ≠ f&apos;g&apos; — يجب استخدام قاعدة الضرب!</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>❌ خطأ</span><h4>نسيان السالب</h4></div>
                <p>d/dx(cos x) = -sin x وليس sin x</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>❌ خطأ</span><h4>لوبيتال الخاطئ</h4></div>
                <p>تطبيق لوبيتال عندما لا يكون الشكل 0/0</p>
              </div>
              <div className="cc">
                <div className="cch"><span className="cbdg" style={{background:'rgba(239,92,92,0.15)',color:'var(--red)'}}>❌ خطأ</span><h4>نسيان C</h4></div>
                <p>∫f(x)dx = F(x) + C دائماً!</p>
              </div>
            </div>
          </div>

          <div className="note i">
            <div className="nic">🎉</div>
            <p><strong>تهانينا!</strong> لقد أكملت موسوعة حساب التفاضل والتكامل. استخدم المساعد الذكي لأي سؤال، وراجع الأبواب عند الحاجة!</p>
          </div>
        </div>

        {/* PAGE 10: SOLVED EXAM PROBLEMS */}
        <div id="p10" className={`pg ${currentPage === 'p10' ? 'on' : ''}`}>
          <div className="pt">📝 <span className="hl">مسائل محلولة من الامتحانات</span></div>
          <div className="ps">مسائل حقيقية مع شرح خطوة بخطوة! 🎯</div>

          {/* المسألة 1: تكامل e^x */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">1</div><h2>تكامل أسي معقد<small>∫ e³ˣ/(e²ˣ + 2eˣ - 3) dx</small></h2></div>
            
            <div className="fml big">∫ e³ˣ/(e²ˣ + 2eˣ - 3) dx</div>
            
            <div className="con g">
              <h4>🔑 فكرة الحل</h4>
              <p>المقام يحتوي eˣ → نعوّض u = eˣ</p>
            </div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>التعويض:</strong> u = eˣ → du = eˣ dx</p></div>
                <div className="step"><div className="snum">2</div><p><strong>تحويل البسط:</strong> e³ˣ = e²ˣ · eˣ = u² · du/eˣ = u² · du/u = u·du</p></div>
                <div className="step"><div className="snum">3</div><p><strong>تحليل المقام:</strong> u² + 2u - 3 = (u+3)(u-1)</p></div>
                <div className="step"><div className="snum">4</div><p><strong>الكسور الجزئية:</strong> u/[(u+3)(u-1)] = A/(u+3) + B/(u-1)</p></div>
                <div className="step"><div className="snum">5</div><p>u = A(u-1) + B(u+3)</p></div>
                <div className="step"><div className="snum">6</div><p>u=1: 1 = 4B → B = 1/4 | u=-3: -3 = -4A → A = 3/4</p></div>
                <div className="step"><div className="snum">7</div><p>∫ [3/4·1/(u+3) + 1/4·1/(u-1)] du</p></div>
                <div className="step"><div className="snum">8</div><p>= <strong>3/4 ln|eˣ+3| + 1/4 ln|eˣ-1| + C ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* المسألة 2: تكامل مثلثي */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">2</div><h2>تكامل مثلثي بالتجزئة<small>∫ x sec²x tan x dx</small></h2></div>
            
            <div className="fml big">∫ x sec²x tan x dx</div>
            
            <div className="con pp">
              <h4>🔑 فكرة الحل</h4>
              <p>نستخدم التكامل بالتجزئة IBP — نلاحظ أن sec²x tan x هو مشتقة ½tan²x</p>
            </div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>ملاحظة مهمة:</strong> d/dx(tan²x) = 2tan x · sec²x</p></div>
                <div className="step"><div className="snum">2</div><p>إذاً sec²x tan x = ½ d/dx(tan²x)</p></div>
                <div className="step"><div className="snum">3</div><p><strong>التعويض:</strong> ∫ x · ½ d(tan²x)</p></div>
                <div className="step"><div className="snum">4</div><p><strong>التجزئة:</strong> u = x, dv = ½d(tan²x)</p></div>
                <div className="step"><div className="snum">5</div><p>= x · ½tan²x - ∫ ½tan²x dx</p></div>
                <div className="step"><div className="snum">6</div><p><strong>لحساب ∫tan²x:</strong> tan²x = sec²x - 1</p></div>
                <div className="step"><div className="snum">7</div><p>∫tan²x dx = ∫(sec²x - 1) dx = tan x - x + C</p></div>
                <div className="step"><div className="snum">8</div><p>= <strong>½x tan²x - ½tan x + ½x + C ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* المسألة 3: المساحة بين منحنيات */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">3</div><h2>مساحة بين منحنيات<small>f(x) = x² + 11, g(x) = x⁴ - 1</small></h2></div>
            
            <div className="fml">f(x) = x² + 11, g(x) = x⁴ - 1</div>
            <div className="flbl">جد المساحة المحصورة بين المنحنيين</div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>نقاط التقاطع:</strong> x² + 11 = x⁴ - 1</p></div>
                <div className="step"><div className="snum">2</div><p>x⁴ - x² - 12 = 0</p></div>
                <div className="step"><div className="snum">3</div><p>نضع y = x²: y² - y - 12 = 0 → (y-4)(y+3) = 0</p></div>
                <div className="step"><div className="snum">4</div><p>y = 4 (y = -3 مرفوض) ← x² = 4 → x = ±2</p></div>
                <div className="step"><div className="snum">5</div><p><strong>من الأعلى؟</strong> اختبر x=0: f(0)=11, g(0)=-1 ← f أعلى</p></div>
                <div className="step"><div className="snum">6</div><p>A = ∫₋₂² [(x²+11) - (x⁴-1)] dx</p></div>
                <div className="step"><div className="snum">7</div><p>A = ∫₋₂² (-x⁴ + x² + 12) dx</p></div>
                <div className="step"><div className="snum">8</div><p>= [-x⁵/5 + x³/3 + 12x]₋₂²</p></div>
                <div className="step"><div className="snum">9</div><p>= (-32/5 + 8/3 + 24) - (32/5 - 8/3 - 24) = <strong>1432/15 ≈ 95.5 وحدة مربعة ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* المسألة 4: مساحة مقيدة بخط */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">4</div><h2>مساحة محصورة بمنحنى وخطوط<small>f(x) = √(x-2), x = 6, y = 5</small></h2></div>
            
            <div className="fml">f(x) = √(x-2), x = 6, y = 5</div>
            <div className="flbl">جد المساحة المحصورة بين المنحنى والخطوط</div>
            
            <div className="con">
              <h4>🎨 رسم المسألة</h4>
              <p>• y = √(x-2) تبدأ من x = 2</p>
              <p>• x = 6 خط عمودي</p>
              <p>• y = 5 خط أفقي</p>
            </div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>نقطة تقاطع y=5 مع المنحنى:</strong> √(x-2) = 5</p></div>
                <div className="step"><div className="snum">2</div><p>x - 2 = 25 → x = 27</p></div>
                <div className="step"><div className="snum">3</div><p><strong>نقطة تقاطع المنحنى مع x=6:</strong> y = √(6-2) = 2</p></div>
                <div className="step"><div className="snum">4</div><p><strong>نقطة تقاطع y=5 مع x=6:</strong> (6, 5)</p></div>
                <div className="step"><div className="snum">5</div><p><strong>المنطقة:</strong> من x=2 إلى x=6 تحت المنحنى، ومن x=6 إلى x=27 تحت y=5</p></div>
                <div className="step"><div className="snum">6</div><p>A = ∫₂⁶ √(x-2) dx + ∫₆²⁷ 5 dx - ∫₆²⁷ √(x-2) dx</p></div>
                <div className="step"><div className="snum">7</div><p><strong>التبسيط:</strong> نحسبها بطريقة أخرى:</p></div>
                <div className="step"><div className="snum">8</div><p>A = ∫₂²⁷ (5 - √(x-2)) dx + المساحة أسفل x=6</p></div>
                <div className="step"><div className="snum">9</div><p>= <strong>125/3 وحدة مربعة ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* المسألة 5: معادلة تفاضلية */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">5</div><h2>معادلة تفاضلية<small>dy/dx = 2x/(3y-2) - x/(2y-1), y(2) = 1</small></h2></div>
            
            <div className="fml big">dy/dx = 2x/(3y-2) - x/(2y-1), y(2) = 1</div>
            
            <div className="con gr">
              <h4>🔑 نوع المسألة</h4>
              <p>معادلة تفاضلية قابلة للفصل — نفصل المتغيرات x و y</p>
            </div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>توحيد المقامات:</strong></p></div>
                <div className="step"><div className="snum">2</div><p>dy/dx = [2x(2y-1) - x(3y-2)] / [(3y-2)(2y-1)]</p></div>
                <div className="step"><div className="snum">3</div><p>= [4xy - 2x - 3xy + 2x] / [(3y-2)(2y-1)]</p></div>
                <div className="step"><div className="snum">4</div><p>= xy / [(3y-2)(2y-1)]</p></div>
                <div className="step"><div className="snum">5</div><p><strong>فصل المتغيرات:</strong> (3y-2)(2y-1)/y dy = x dx</p></div>
                <div className="step"><div className="snum">6</div><p>(6y - 7 + 2/y) dy = x dx</p></div>
                <div className="step"><div className="snum">7</div><p><strong>التكامل:</strong> 3y² - 7y + 2ln|y| = x²/2 + C</p></div>
                <div className="step"><div className="snum">8</div><p><strong>تطبيق الشرط y(2)=1:</strong> 3 - 7 + 0 = 2 + C → C = -6</p></div>
                <div className="step"><div className="snum">9</div><p><strong>الحل:</strong> <strong>3y² - 7y + 2ln|y| = x²/2 - 6 ✓</strong></p></div>
              </div>
            </div>
          </div>

          {/* المسألة 6: معادلة تفاضلية من الدرجة الثانية */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">6</div><h2>معادلة تفاضلية من الدرجة الثانية<small>y'' - 2y' + 2y = 0</small></h2></div>
            
            <div className="fml big">y'' - 2y' + 2y = 0</div>
            
            <div className="con pp">
              <h4>🔑 نوع المسألة</h4>
              <p>معادلة تفاضلية خطية متجانسة من الدرجة الثانية ذات معاملات ثابتة</p>
            </div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>المعادلة المميزة:</strong> r² - 2r + 2 = 0</p></div>
                <div className="step"><div className="snum">2</div><p><strong>حل المعادلة:</strong> r = (2 ± √(4-8))/2 = (2 ± 2i)/2 = 1 ± i</p></div>
                <div className="step"><div className="snum">3</div><p><strong>الحل العام:</strong> y = eˣ(A cos x + B sin x)</p></div>
                <div className="step"><div className="snum">4</div><p>حيث A و B ثوابت تُحدد من الشروط الابتدائية</p></div>
              </div>
            </div>
          </div>

          {/* المسألة 7: المشتقة الضمنية */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">7</div><h2>مشتقة ضمنية<small>x² + 4xy + 2y² = 7</small></h2></div>
            
            <div className="fml big">x² + 4xy + 2y² = 7</div>
            <div className="flbl">جد dy/dx</div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>نشتق كلا الطرفين بالنسبة لـ x:</strong></p></div>
                <div className="step"><div className="snum">2</div><p>2x + 4(y + x·dy/dx) + 4y·dy/dx = 0</p></div>
                <div className="step"><div className="snum">3</div><p>2x + 4y + 4x·dy/dx + 4y·dy/dx = 0</p></div>
                <div className="step"><div className="snum">4</div><p><strong>نجمع حدود dy/dx:</strong> (4x + 4y)·dy/dx = -2x - 4y</p></div>
                <div className="step"><div className="snum">5</div><p><strong>dy/dx = (-2x - 4y)/(4x + 4y) = (-x - 2y)/(2x + 2y) ✓</strong></p></div>
              </div>
            </div>
            
            <h3>📌 إذا أعطيت 3x + 4y = 2</h3>
            <div className="ex">
              <div className="exlbl">✏️ جد نقطة التماس</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p>من 3x + 4y = 2: y = (2-3x)/4</p></div>
                <div className="step"><div className="snum">2</div><p>نعوّض في x² + 4xy + 2y² = 7</p></div>
                <div className="step"><div className="snum">3</div><p>x² + 4x·(2-3x)/4 + 2·[(2-3x)/4]² = 7</p></div>
                <div className="step"><div className="snum">4</div><p>نحل المعادلة لإيجاد x ثم y</p></div>
              </div>
            </div>
          </div>

          {/* المسألة 8: الاشتقاق اللوغاريتمي */}
          <div className="lbox">
            <div className="lhead"><div className="lnum">8</div><h2>الاشتقاق اللوغاريتمي<small>y = (x²+3)^(x-1)</small></h2></div>
            
            <div className="fml big">y = (x²+3)^(x-1)</div>
            <div className="flbl">جد dy/dx</div>
            
            <div className="con g">
              <h4>🔑 متى نستخدم الاشتقاق اللوغاريتمي؟</h4>
              <p>عندما يكون المتغير x في الأس <strong>و</strong> في القاعدة معاً!</p>
            </div>
            
            <div className="ex">
              <div className="exlbl">✏️ الحل خطوة بخطوة</div>
              <div className="steps">
                <div className="step"><div className="snum">1</div><p><strong>نأخذ ln لكلا الطرفين:</strong> ln y = (x-1) ln(x²+3)</p></div>
                <div className="step"><div className="snum">2</div><p><strong>نشق كلا الطرفين:</strong> y'/y = d/dx[(x-1) ln(x²+3)]</p></div>
                <div className="step"><div className="snum">3</div><p><strong>قاعدة الضرب:</strong> = 1·ln(x²+3) + (x-1)·2x/(x²+3)</p></div>
                <div className="step"><div className="snum">4</div><p><strong>y'/y = ln(x²+3) + 2x(x-1)/(x²+3)</strong></p></div>
                <div className="step"><div className="snum">5</div><p><strong>النتيجة:</strong> dy/dx = (x²+3)^(x-1) · [ln(x²+3) + 2x(x-1)/(x²+3)] ✓</p></div>
              </div>
            </div>
          </div>

          <div className="note i">
            <div className="nic">💡</div>
            <p><strong>نصيحة:</strong> المسائل "الغريبة" تحتاج تفكير خارج الصندوق! دائماً اسأل نفسك: ما هو التعويض المناسب؟ هل يمكنني تبسيط المقام؟</p>
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
              <div id="cbst" className={isTyping ? 'busy' : ''}>{isTyping ? 'يكتب...' : 'متصل'}</div>
            </div>
          </div>
          <button id="cbx" onClick={() => setChatOpen(false)}>✕</button>
        </div>
        
        <div id="cbmsgs">
          {messages.map((msg, i) => (
            <div key={i} className={`cm ${msg.role === 'user' ? 'u' : ''}`}>
              <div className="cma">{msg.role === 'user' ? '👤' : '🧮'}</div>
              <div className="cbb">{msg.content}</div>
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

      {/* زر حالة السيرفر */}
      <button 
        id="fab" 
        style={{left: '28px', bottom: '100px', width: '50px', height: '50px', fontSize: '22px'}}
        onClick={() => setServerPanelOpen(!serverPanelOpen)}
      >
        ⚙️
      </button>

      {/* لوحة حالة السيرفر */}
      {serverPanelOpen && (
        <div style={{
          position: 'fixed',
          bottom: '170px',
          left: '22px',
          width: '340px',
          background: '#060d18',
          border: '1px solid rgba(56,182,240,0.2)',
          borderRadius: '16px',
          padding: '20px',
          zIndex: 9997,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <h3 style={{color: 'var(--blue)', fontSize: '16px'}}>🖥️ حالة السيرفر</h3>
            <button onClick={() => setServerPanelOpen(false)} style={{background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px'}}>✕</button>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px'}}>
            <div style={{background: 'var(--s2)', padding: '12px', borderRadius: '10px', textAlign: 'center'}}>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: serverHealth?.status === 'healthy' ? 'var(--green)' : 'var(--red)'}}>
                {serverHealth?.status === 'healthy' ? '✓' : '✗'}
              </div>
              <div style={{fontSize: '11px', color: 'var(--muted)'}}>الحالة</div>
            </div>
            <div style={{background: 'var(--s2)', padding: '12px', borderRadius: '10px', textAlign: 'center'}}>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--blue)'}}>
                {serverHealth?.stats.errors || 0}
              </div>
              <div style={{fontSize: '11px', color: 'var(--muted)'}}>أخطاء</div>
            </div>
            <div style={{background: 'var(--s2)', padding: '12px', borderRadius: '10px', textAlign: 'center'}}>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)'}}>
                {serverHealth?.stats.warnings || 0}
              </div>
              <div style={{fontSize: '11px', color: 'var(--muted)'}}>تحذيرات</div>
            </div>
            <div style={{background: 'var(--s2)', padding: '12px', borderRadius: '10px', textAlign: 'center'}}>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--green)'}}>
                {serverHealth?.stats.improvements || 0}
              </div>
              <div style={{fontSize: '11px', color: 'var(--muted)'}}>تحسينات</div>
            </div>
          </div>

          <button
            onClick={improveServerCode}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--purple), var(--blue))',
              border: 'none',
              color: '#000',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🤖 تحسين ذاتي بالذكاء الاصطناعي
          </button>

          <div style={{marginTop: '12px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center'}}>
            النموذج: Claude 3.5 Haiku (مجاني)
          </div>
        </div>
      )}

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
    </>
  )
}
