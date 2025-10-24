import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import bgImage from '../assets/doc4.png';

type Role = 'doctor' | 'patient' | 'system';
interface Msg { role: Role; text: string }

type Phase = 'INFO_COLLECTION' | 'PRELIMINARY_DIAGNOSIS' | 'AUXILIARY_VERIFICATION' | 'TREATMENT_PLAN';

const phaseConfig: Record<Phase, { name: string; description: string; next: Phase | null }> = {
  INFO_COLLECTION: { name: '信息采集', description: '请系统性询问患者情况，包括主诉、现病史、既往史等。可进行视、触、叩、听诊。' , next: 'PRELIMINARY_DIAGNOSIS' },
  PRELIMINARY_DIAGNOSIS: { name: '初步判断', description: '基于当前信息，提出最可能的疾病假设。' , next: 'AUXILIARY_VERIFICATION' },
  AUXILIARY_VERIFICATION: { name: '辅助验证', description: '为验证诊断，请开具针对性检查，如实验室、影像学检查。' , next: 'TREATMENT_PLAN' },
  TREATMENT_PLAN: { name: '治疗和评估', description: '根据诊断结果，制定治疗方案，如药物、手术或生活方式干预。' , next: null },
};

const patientProfile = {
  caseId: 'case-a',
  trueDiagnosis: '急性上呼吸道感染',
  responses: {
    '主诉': '医生您好，我发烧3天了，还一直咳嗽。',
    '现病史': '大概3天前开始的，没有特别的原因，感觉浑身没劲，不想吃饭。晚上咳嗽得更厉害，有点胸口疼。',
    '既往史': '我身体一直挺好的，很少生病，没有高血压、糖尿病这些慢性病。',
    '过敏史': '对青霉素过敏。',
    '个人史': '不抽烟不喝酒，作息还算规律。',
    '家族病史': '家里人也都健康。',
    '视诊': '患者神志清楚，精神稍差，面色微红，无皮疹。',
    '触诊': '全身浅表淋巴结未触及肿大，腹部柔软，无压痛。',
    '叩诊': '心界不大，肺部叩诊呈清音。',
    '听诊': '双肺呼吸音粗，可闻及少量湿啰音，心率98次/分，律齐。',
    '检查结果': '血常规显示白细胞总数12.5 x 10^9/L，中性粒细胞85%。CRP 25mg/L。胸部X线片显示肺纹理增粗。'
  }
};

export default function ConsultationChat() {
  const nav = useNavigate();
  const loc = useLocation();
  const params = useParams();
  const caseId = params.caseId ?? (loc.state as any)?.caseId ?? 'case-a';
  const caseTitle = (loc.state as any)?.title ?? '未命名病例';
  const department = (loc.state as any)?.department ?? undefined;
  // 记录本次研习开始时间
  useEffect(() => {
    try {
      localStorage.setItem(`sessionStart:${caseId}`, String(Date.now()));
    } catch (e) { console.error('记录研习开始时间失败', e); }
  }, [caseId]);
  const [phase, setPhase] = useState<Phase>('INFO_COLLECTION');
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'system',
      text: `演练开始。当前阶段：【${phaseConfig[phase].name}】。${phaseConfig[phase].description}`,
    },
    {
      role: 'patient',
      text: '医生好，我觉得不舒服',
    }
  ]);
  const [input, setInput] = useState('');
  const [lastApiError, setLastApiError] = useState<string | null>(null);

  const [waitingForDiagnosis, setWaitingForDiagnosis] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // 恢复并控制智能提示的显示
  const [showSmartPrompts, setShowSmartPrompts] = useState(false);
  const [smartClickCount, setSmartClickCount] = useState(0);
  const promptTimerRef = useRef<number | null>(null);
  const [awaitingFinalDiagnosis, setAwaitingFinalDiagnosis] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('正在生成回复…');
  function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function startToast(text = '正在生成回复…') { setToastText(text); setShowToast(true); }
  function stopToast() { setShowToast(false); }
  useEffect(() => {
    return () => { if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current); };
  }, []);
 
  
  const smartPrompts = useMemo(() => {
    switch (phase) {
      case 'INFO_COLLECTION':
        return ['询问现病史', '询问既往史', '询问过敏史', '进行视诊', '进行触诊', '进行叩诊', '进行听诊'];
      case 'PRELIMINARY_DIAGNOSIS':
        return ['初步诊断：考虑急性上呼吸道感染？'];
      case 'AUXILIARY_VERIFICATION':
        return ['建议进行血常规检查', '建议进行CRP检测', '建议进行胸片检查'];
      case 'TREATMENT_PLAN':
        return ['制定治疗方案', '一般治疗与用药建议'];
      default:
        return [];
    }
  }, [phase]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);



  function addMsg(m: Msg) { setMessages((prev) => [...prev, m]); }
  function addSystem(text: string) { addMsg({ role: 'system', text }); }

  // 外部对话API调用函数（按用户提供的schema：userid/question/history）
  async function callSiliconFlowAPI(doctorText: string): Promise<string> {
    try {
      const userid = localStorage.getItem('username') || 'guest';
      // 构建历史记录：仅保留 doctor->user, patient->assistant，剔除 system，并保证以 user 开头且成对交替
      const normalized = messages
        .map(m => {
          if (m.role === 'doctor') return { role: 'user' as const, content: m.text };
          if (m.role === 'patient') return { role: 'assistant' as const, content: m.text };
          return null;
        })
        .filter(Boolean) as { role: 'user' | 'assistant'; content: string }[];
      while (normalized.length && normalized[0].role !== 'user') normalized.shift();
      const history: { role: 'user' | 'assistant'; content: string }[] = [];
      let expect: 'user' | 'assistant' = 'user';
      for (const msg of normalized) {
        if (msg.role === expect) {
          history.push(msg);
          expect = expect === 'user' ? 'assistant' : 'user';
        } else if (msg.role === 'user') {
          // 发现新的用户消息，重新开始配对
          history.push(msg);
          expect = 'assistant';
        } // 当期望用户时遇到assistant则跳过，保证交替
      }
      // 去掉尾部未配对的用户消息（当前问题由 question 字段传入）
      if (history.length && history[history.length - 1].role === 'user') {
        history.pop();
      }

      const payload = { userid, question: doctorText, history };

      const API_BASE = import.meta.env.PROD ? 'http://47.106.211.121:8102' : '';
      const response = await fetch(`${API_BASE}/aiChat`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('对话接口返回:', data);
      if (data?.status === 200 && typeof data?.answer === 'string') {
        setLastApiError(null);
        return data.answer;
      }
      const reason = typeof data?.answer === 'string' ? data.answer : '服务返回非200状态';
      throw new Error(reason);
    } catch (error) {
      console.error('API调用错误:', error);
      setLastApiError(error instanceof Error ? error.message : String(error));
      // 如果API调用失败，回退到原有的模拟回复逻辑
      return generateFallbackResponse(doctorText);
    }
  }

  // 备用回复逻辑（当API调用失败时使用）
  function generateFallbackResponse(doctorText: string): string {
    const lowerText = doctorText.toLowerCase();
    if (lowerText.includes('现病史')) return patientProfile.responses['现病史'];
    if (lowerText.includes('既往史')) return patientProfile.responses['既往史'];
    if (lowerText.includes('过敏')) return patientProfile.responses['过敏史'];
    if (lowerText.includes('个人史') || lowerText.includes('生活习惯')) return patientProfile.responses['个人史'];
    if (lowerText.includes('家族')) return patientProfile.responses['家族病史'];
    if (lowerText.includes('视诊')) return patientProfile.responses['视诊'];
    if (lowerText.includes('触诊')) return patientProfile.responses['触诊'];
    if (lowerText.includes('叩诊')) return patientProfile.responses['叩诊'];
    if (lowerText.includes('听诊')) return patientProfile.responses['听诊'];
    if (lowerText.includes('检查') || lowerText.includes('化验')) return patientProfile.responses['检查结果'];
    if (phase === 'PRELIMINARY_DIAGNOSIS') return '好的医生，根据您说的，我大概是什么问题呢？';
    if (phase === 'TREATMENT_PLAN') return '好的，谢谢医生，我会按您说的做。';
    return '嗯，您继续问吧。';
  }

  // 新增：完成诊断按钮的处理逻辑
  function handleCompleteDiagnosisClick() {
    addMsg({ role: 'system', text: '请给出你的最终诊断与治疗方案（不少于两句）' });
    setAwaitingFinalDiagnosis(true);
  }

  async function handleSend(prompt?: string) {
    // 支持从智能提示触发时不显示等待气泡
    const suppressWaiting = (arguments.length > 1 && typeof arguments[1] === 'object' && (arguments[1] as any)?.suppressWaiting) === true;
    const text = (prompt || input).trim();
     if (!text) return;
     setInput('');
     addMsg({ role: 'doctor', text });

     // 完成诊断后用户回答拦截：医生给出最终答案后提示查看结果
     if (awaitingFinalDiagnosis) {
        setAwaitingFinalDiagnosis(false);
        addMsg({ role: 'system', text: '您已完成模拟诊断啦，请查看你的得分和复盘把，点击查看' });
        return;
      }

     // 如果在初步判断阶段且等待诊断回答
     if (phase === 'PRELIMINARY_DIAGNOSIS' && waitingForDiagnosis) {
       const isCorrect = checkDiagnosis(text);
       setWaitingForDiagnosis(false);

       if (isCorrect) {
        // 诊断正确，直接跳转到治疗阶段
        addMsg({ role: 'patient', text: '是的医生，您诊断得很准确！那我应该怎么治疗呢？' });
         setTimeout(() => {
           setPhase('TREATMENT_PLAN');
           addSystem(`阶段变更。当前阶段：【${phaseConfig['TREATMENT_PLAN'].name}】。${phaseConfig['TREATMENT_PLAN'].description}`);
         }, 500);
         return;
       } else {
        // 诊断不准确，给出提示并继续到辅助验证
        addMsg({ role: 'patient', text: '嗯...我觉得可能还需要做一些检查来确认一下，医生您觉得需要做什么检查呢？' });
         setTimeout(() => {
           setPhase('AUXILIARY_VERIFICATION');
           addSystem(`阶段变更。当前阶段：【${phaseConfig['AUXILIARY_VERIFICATION'].name}】。${phaseConfig['AUXILIARY_VERIFICATION'].description}`);
         }, 500);
         return;
       }
     }

     // 使用外部对话API生成患者回复（失败则自动回退到本地模拟回复），智能提示触发时不展示等待气泡
    let reply: string;
    if (suppressWaiting) {
      reply = await callSiliconFlowAPI(text);
    } else {
      startToast();
      [reply] = await Promise.all([
        callSiliconFlowAPI(text),
        delay(2000)
      ]);
      stopToast();
    }
    addMsg({ role: 'patient', text: reply });
   }

  function handleNextPhase() {
    const next = phaseConfig[phase].next;
    if (next) {
      setPhase(next);
      addSystem(`阶段变更。当前阶段：【${phaseConfig[next].name}】。${phaseConfig[next].description}`);

      // 如果进入初步判断阶段，AI主动询问诊断（先展示等待toast约2秒）
      if (next === 'PRELIMINARY_DIAGNOSIS') {
        // 灰字提示无需等待气泡，患者主动提问保留即时展示
        addMsg({ role: 'patient', text: '医生好，您觉得我得的是什么病呢？' });
        setWaitingForDiagnosis(true);
      }
    } else {
      // End of consultation, navigate to summary/scoring page
      nav('/result', { state: { caseId, title: caseTitle, department } });
    }
  }

  // 检查诊断是否准确
  function checkDiagnosis(doctorText: string): boolean {
    const lowerText = doctorText.toLowerCase();
    const trueDiagnosis = patientProfile.trueDiagnosis.toLowerCase();
    const keywords = ['急性', '上呼吸道', '感染', '呼吸道感染', '上感'];
    return keywords.some(keyword => lowerText.includes(keyword)) ||
           lowerText.includes(trueDiagnosis);
  }

  // 智能提示触发函数
  function triggerSmartPrompt() {
    setShowSmartPrompts(true);
    setSmartClickCount((c) => c + 1);
    if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
    // 自动隐藏智能提示，回归旧版交互
    promptTimerRef.current = window.setTimeout(() => {
      setShowSmartPrompts(false);
    }, 5000);
  }

  function handleSmartPromptAction(promptText: string) {
    // 智能提示触发不显示等待气泡
    (handleSend as any)(promptText, { suppressWaiting: true });
    setShowSmartPrompts(false);
  }

  function renderSmartPrompts() {
    const step = smartClickCount;

    if (!showSmartPrompts) return null;

    let title = '';
    let buttons: { text: string; action: () => void; }[] = [];

    switch (step) {
      case 1:
        title = '您可以询问病史唷';
        buttons = [
          { text: '询问个人病史', action: () => handleSmartPromptAction('请介绍一下您的个人史') },
        ];
        break;
      case 2:
        title = '建议您对病人进行体格检查呀';
        buttons = ['视诊', '触诊', '叩诊', '听诊'].map(item => ({ text: item, action: () => handleSmartPromptAction(`进行${item}`) }));
        break;
      case 3:
        title = '您可以对病人进行辅助检查';
        buttons = [
          { text: '进行辅助检查', action: () => handleSmartPromptAction('进行辅助检查') },
        ];
        break;
      case 4:
        title = '好像您已经基本完成了问诊过程，请告诉我你的最终答案吧，请点击完成诊断';
        buttons = [
          { text: '完成诊断', action: () => handleCompleteDiagnosisClick() },
        ];
        break;
      default:
        title = '我已经把知道的都告诉你啦，您可以直接完成诊断啦~';
        break;
    }

    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-full sm:w-[30rem] max-h-80 mb-2 mr-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <button
            onClick={() => setShowSmartPrompts(false)}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            关闭
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F0F2FF] flex flex-col font-sans"
    >
      <header className="bg-white sticky top-0 z-10 p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="p-2 rounded-md hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-bold text-lg">模拟问诊</span>
        </div>
      </header>

      <main ref={listRef} className="relative flex-1 overflow-auto p-4 space-y-6">
        
        {messages.map((m, i) => {
          const isDoctor = m.role === 'doctor';
          const isSystem = m.role === 'system';

          if (isSystem) {
            const hasLink = m.text.includes('点击查看');
            return (
              <div key={i} className="text-center my-4">
                <div className="inline-block bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
                  {hasLink ? (
                    <>
                      {m.text.split('点击查看')[0]}
                      <span className="text-blue-600 cursor-pointer" onClick={() => nav('/result', { state: { caseId, title: caseTitle, department } })}>点击查看</span>
                    </>
                  ) : m.text}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={`flex items-start gap-3 ${isDoctor ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-lg lg:max-w-xl px-5 py-4 rounded-2xl shadow-md ${isDoctor ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                <p className="text-base leading-relaxed">{m.text}</p>
                {m.role === 'patient' && m.text.includes("检查报告") && 
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span>如有相关检查报告，可点击上传</span>
                        <button className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300">上传</button>
                    </div>
                }
              </div>
            </div>
          );
        })}
        
      </main>

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="waiting-bubble">
            <div className="chat-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 sticky bottom-0 rounded-t-2xl shadow-2xl">
        <div className="flex justify-start items-center mb-4 gap-2">
            <button onClick={triggerSmartPrompt} className="bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-50 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>
                智能提示
            </button>
            <button onClick={handleCompleteDiagnosisClick} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:bg-green-700">
                完成诊断
            </button>
        </div>

        {renderSmartPrompts()}
        {lastApiError && (
          <div className="mb-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-md p-2">
            对话接口错误：{lastApiError}
          </div>
        )}
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-2">
          <button className="p-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v2a3 3 0 01-3 3z" /></svg>
          </button>
          <input 
            type="text" 
            placeholder="有什么健康问题告诉我吗"
            className="flex-1 w-full bg-transparent focus:outline-none text-base"
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
          />
          <button className="p-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700" onClick={() => handleSend()}>
            发送
          </button>
        </div>
      </footer>
    </div>
  );
}