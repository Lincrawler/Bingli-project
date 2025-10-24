import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Award, TrendingUp, Clock, Target, BookOpen } from 'lucide-react';
 
 export default function Result() {
   const nav = useNavigate();
  const loc = useLocation();
  const { caseId, title, department, fromHistory } = (loc.state as any) || {};

   // 模拟得分数据
   const scoreData = {
     totalScore: 85,
     maxScore: 100,
     stageScores: [
       { stage: '信息采集', score: 90, maxScore: 25, feedback: '问诊全面，重点突出，能够准确获取关键信息' },
       { stage: '初步诊断', score: 80, maxScore: 25, feedback: '诊断思路清晰，但需要更多考虑鉴别诊断' },
       { stage: '辅助验证', score: 85, maxScore: 25, feedback: '检查项目选择合理，解读准确' },
       { stage: '治疗评估', score: 85, maxScore: 25, feedback: '治疗方案基本合理，需要更详细的用药指导' }
     ],
     duration: '15分32秒',
     rank: 'A'
   };

   // 结果页写入研习完成时间、得分与时长（分钟）
   useEffect(() => {
     try {
       // 从历史进入结果页则不写入记录，避免重复
       if (fromHistory) return;
       // 读取会话开始时间并计算时长
       const startRaw = localStorage.getItem(`sessionStart:${caseId}`);
       let durationMinutes: number | undefined = undefined;
       if (startRaw) {
         const startTs = parseInt(startRaw, 10);
         if (!Number.isNaN(startTs)) {
           durationMinutes = Math.max(1, Math.round((Date.now() - startTs) / 60000));
         }
         localStorage.removeItem(`sessionStart:${caseId}`);
       }
       const raw = localStorage.getItem('historyCases');
       const arr = raw ? JSON.parse(raw) : [];
       const idx = arr.findIndex((it: any) => it && it.id === caseId);
       if (idx >= 0) {
         const it = arr[idx];
         if (!it.finishedAt) {
           it.title = title ?? it.title;
           it.department = department ?? it.department;
           it.finishedAt = new Date().toISOString();
           it.score = scoreData.totalScore;
           if (typeof durationMinutes === 'number') it.durationMinutes = durationMinutes;
         }
       } else if (caseId) {
         arr.push({ id: caseId, title: title ?? '未命名病例', department, finishedAt: new Date().toISOString(), score: scoreData.totalScore, durationMinutes });
       }
       localStorage.setItem('historyCases', JSON.stringify(arr));
     } catch (e) { console.error('写入研习历史失败', e); }
    }, []);
   // 新增：将超出范围的阶段得分标准化（若score>maxScore则按百分比换算到maxScore）
   const normalizeScore = (score: number, maxScore: number) => {
     if (maxScore <= 0) return 0;
     if (score <= maxScore) return Math.max(0, Math.min(score, maxScore));
     const pct = Math.max(0, Math.min(score, 100));
     return Math.round((pct / 100) * maxScore);
   };
   
   const getScoreColor = (score: number, maxScore: number) => {
     const percentage = (score / maxScore) * 100;
     if (percentage >= 90) return 'text-success';
     if (percentage >= 80) return 'text-primary';
     if (percentage >= 70) return 'text-warning';
     return 'text-danger';
   };
   
   const getScoreBadgeClass = (score: number, maxScore: number) => {
     const percentage = (score / maxScore) * 100;
     if (percentage >= 90) return 'bg-green-100 text-green-800';
     if (percentage >= 80) return 'bg-blue-100 text-blue-800';
     if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
     return 'bg-red-100 text-red-800';
   };
   
   const getProgressBarClass = (score: number, maxScore: number) => {
     const percentage = (score / maxScore) * 100;
     if (percentage >= 90) return 'bg-green-500';
     if (percentage >= 80) return 'bg-blue-500';
     if (percentage >= 70) return 'bg-yellow-500';
     return 'bg-red-500';
   };
   
   return (
     <div className="min-h-screen bg-gray-50">
       <header className="bg-white shadow-sm sticky top-0 z-10">
         <div className="max-w-md mx-auto px-4 py-3 flex items-center">
           <button onClick={() => nav('/')} className="text-gray-600 hover:text-gray-800">
             <span className="text-lg">＜</span>
           </button>
           <div className="flex-1 text-center">
             <h1 className="font-bold text-gray-800">问诊结果</h1>
           </div>
           <div className="w-8"></div>
         </div>
       </header>
   
       <main className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-32 sm:pb-36">
         {/* 总分展示 */}
         <section className="bg-white rounded-lg shadow-sm">
           <div className="p-3 sm:p-4">
             <div className="flex justify-between items-center mb-3 sm:mb-4">
               <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                 <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                 总体评分
               </h2>
               <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold ${getScoreBadgeClass(scoreData.totalScore, scoreData.maxScore)}`}>
                 等级 {scoreData.rank}
               </span>
             </div>
             
             <div className="text-center mb-3 sm:mb-4">
               <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2 sm:mb-3">
                 {scoreData.totalScore}<span className="text-lg sm:text-xl text-gray-500">/{scoreData.maxScore}</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2 sm:mb-3">
                 <div 
                   className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 sm:h-3 rounded-full"
                   style={{ width: `${(scoreData.totalScore / scoreData.maxScore) * 100}%` }}
                 ></div>
               </div>
               <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                 <span className="flex items-center gap-1">
                   <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                   用时: {scoreData.duration}
                 </span>
                 <span>优秀表现！</span>
               </div>
             </div>
           </div>
         </section>
   
         {/* 各阶段得分详情 */}
         <section className="bg-white rounded-xl shadow-lg border border-gray-100">
           <div className="p-5">
             <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
               <Target className="w-6 h-6 text-blue-600" />
               各阶段表现
             </h2>
             
             <div className="space-y-5">
               {scoreData.stageScores.map((stage, index) => {
                 const normalized = normalizeScore(stage.score, stage.maxScore);
                 const pct = Math.round((normalized / stage.maxScore) * 100);
                 return (
                 <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-gray-100">
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${getProgressBarClass(normalized, stage.maxScore)}`}>
                         {index + 1}
                       </div>
                       <div>
                         <h3 className="font-bold text-gray-800 text-lg mb-2">{stage.stage}</h3>
                         <div className="flex items-center gap-3">
                           <div className={`text-2xl font-bold ${getScoreColor(normalized, stage.maxScore) === 'text-success' ? 'text-green-600' : getScoreColor(normalized, stage.maxScore) === 'text-primary' ? 'text-blue-600' : getScoreColor(normalized, stage.maxScore) === 'text-warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                             {normalized}
                           </div>
                           <span className="text-gray-500 text-lg">/ {stage.maxScore}</span>
                           <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${getScoreBadgeClass(normalized, stage.maxScore)}`}>
                             {pct}%
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="w-full bg-gray-200 rounded-full h-3 mb-4 shadow-inner">
                     <div 
                       className={`h-3 rounded-full shadow-sm transition-all duration-500 ${getProgressBarClass(normalized, stage.maxScore)}`}
                       style={{ width: `${pct}%` }}
                     ></div>
                   </div>
                   
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                     <p className="text-sm text-gray-700 leading-relaxed">{stage.feedback}</p>
                   </div>
                 </div>
                 );
               })}
             </div>
           </div>
         </section>
   
         {/* 详细复盘内容 - 合并精简改进建议与学习要点 */}
         <section className="bg-white rounded-lg shadow-sm">
           <div className="p-3 sm:p-4">
             <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
               <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
               详细复盘
             </h2>
             
             <div className="space-y-3 sm:space-y-4">
               {/* 参考答案（原标准答案） */}
               <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded">
                 <h3 className="font-semibold flex items-center gap-2 mb-2 sm:mb-3 text-green-800 text-sm sm:text-base">
                   <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                   参考答案
                 </h3>
                 <div className="space-y-2 sm:space-y-3">
                   <div>
                     <h4 className="font-medium text-green-700 mb-1 sm:mb-2 text-xs sm:text-sm">正确诊断</h4>
                     <div className="bg-green-100 border border-green-300 rounded p-2 sm:p-3">
                       <p className="text-xs sm:text-sm text-green-800">急性上呼吸道感染</p>
                     </div>
                   </div>
                   <div>
                     <h4 className="font-medium text-green-700 mb-1 sm:mb-2 text-xs sm:text-sm">标准治疗方案</h4>
                     <div className="bg-green-100 border border-green-300 rounded p-2 sm:p-3">
                       <p className="text-xs sm:text-sm text-green-800">对症治疗（退热、止咳、充分休息、补充水分）；必要时短期使用止痛药或抗炎药；避免不必要的抗生素。</p>
                     </div>
                   </div>
                   <div>
                     <h4 className="font-medium text-green-700 mb-1 sm:mb-2 text-xs sm:text-sm">随访与健康教育</h4>
                     <div className="bg-green-100 border border-green-300 rounded p-2 sm:p-3">
                       <p className="text-xs sm:text-sm text-green-800">观察病情变化，若持续高热或出现呼吸困难需及时复诊；强调个人防护与合理用药；建议合理作息与营养。</p>
                     </div>
                   </div>
                 </div>
               </div>
   
               {/* 我的答案（原优秀表现，补充错误与遗漏点说明） */}
               <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded">
                 <h3 className="font-semibold flex items-center gap-2 mb-2 text-green-800 text-sm sm:text-base">
                   <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                   我的答案
                 </h3>
                 <div className="space-y-2">
                   <div>
                     <h4 className="font-medium text-green-700 mb-1 text-xs sm:text-sm">我的诊断与表现</h4>
                     <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                       <li>• 问诊思路较为系统，能围绕主诉收集关键信息</li>
                       <li>• 体格检查覆盖主要部位，能抓住阳性体征</li>
                       <li>• 辅助检查选择基本合理，结果解读清晰</li>
                       <li>• 诊断依据相对充分，链条较完整</li>
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-medium text-green-700 mb-1 text-xs sm:text-sm">错误点与遗漏点</h4>
                     <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                       <li>• 鉴别诊断覆盖不够全面，缺少关键排除依据</li>
                       <li>• 治疗方案细化不足，未明确具体用药剂量与疗程</li>
                       <li>• 随访计划不够具体，对复诊触发条件阐述不完整</li>
                       <li>• 患者沟通与用药宣教可进一步加强</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </section>
   
         {/* 合并精简：改进建议 + 学习要点 */}
         <section className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
           <h3 className="font-semibold flex items-center gap-2 mb-2 text-blue-800 text-sm sm:text-base">
             <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
             改进与学习要点
           </h3>
           <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
             进一步强化鉴别诊断覆盖与证据链；因人制宜细化治疗与随访；
             加强沟通与并发症预防提示，确保患者理解与配合。
           </p>
         </section>
       </main>
   
       {/* 固定在底部的操作按钮 */}
       <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg">
         <div className="flex flex-col gap-2 sm:gap-3 max-w-md mx-auto">
           <button 
             className="bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors active:bg-blue-800 touch-manipulation"
             onClick={() => nav('/')}
           >
             返回首页
           </button>
         </div>
       </div>
     </div>
   );
 }