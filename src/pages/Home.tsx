import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import doc4Image from '../assets/doc4.png';

export default function Home() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('未登录用户');
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 6;
  // 新增：时间范围筛选状态
  const [timeFilter, setTimeFilter] = useState<'7' | '30' | 'all'>('all');
  // 新增：滑动提示相关状态
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const savedDept = localStorage.getItem('selectedDepartment');
    if (savedDept) setSelectedDepartment(savedDept);
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) setUsername(savedUsername);
  }, []);

  const departments = useMemo(() => [
    { id: 'cardiology', name: '心内科' },
    { id: 'surgery', name: '外科' },
    { id: 'pediatrics', name: '儿科' },
    { id: 'gynecology', name: '妇产科' },
    { id: 'emergency', name: '急诊科' },
  ], []);

  const allCases = useMemo(() => ({
    internal: [
      { id: 'int-001', name: '高血压初诊', summary: '初级病例，学习基本降压药物选择' },
      { id: 'int-002', name: '糖尿病随访', summary: '中级病例，掌握常见并发症处理' },
      { id: 'int-003', name: '慢性胃炎评估', summary: '初级病例，熟悉胃镜报告解读' },
    ],
    surgery: [
        { id: 'sur-001', name: '阑尾炎术后复查', summary: '初级病例，处理术后常见问题' },
        { id: 'sur-002', name: '疝气门诊评估', summary: '中级病例，学习不同疝气修补术选择' },
        { id: 'sur-003', name: '甲状腺结节评估', summary: '中级病例，掌握B超和穿刺指征' },
    ],
    pediatrics: [
        { id: 'ped-001', name: '小儿发热问诊', summary: '初级病例，识别常见感染性疾病' },
        { id: 'ped-002', name: '咳嗽迁延评估', summary: '中级病例，鉴别诊断过敏与感染' },
        { id: 'ped-003', name: '小儿腹泻评估', summary: '初级病例，学习补液和饮食指导' },
    ],
    gynecology: [
        { id: 'gyn-001', name: '孕早期保健', summary: '初级病例，掌握早孕期各项检查' },
        { id: 'gyn-002', name: '产后复查', summary: '中级病例，处理产后常见问题' },
        { id: 'gyn-003', name: '月经不调门诊', summary: '中级病例，学习内分泌调节' },
    ],
    emergency: [
        { id: 'eme-001', name: '胸痛急诊处置', summary: '高级病例，快速鉴别心梗、夹层等' },
        { id: 'eme-002', name: '外伤初步评估', summary: '中级病例，学习ABCDE评估流程' },
        { id: 'eme-003', name: '呼吸困难急救', summary: '高级病例，掌握气管插管指征' },
    ],
    cardiology: [
        { id: 'car-001', name: '心绞痛门诊', summary: '中级病例，学习冠心病药物治疗' },
        { id: 'car-002', name: '心衰复诊', summary: '高级病例，掌握心衰的长期管理' },
        { id: 'car-003', name: '房颤抗凝评估', summary: '中级病例，学习CHADS-VASc评分' },
        { id: 'car-004', name: '高血压危象处理', summary: '高级病例，紧急降压药物应用' },
        { id: 'car-005', name: '急性心包炎诊断', summary: '中级病例，心电图与超声心动图识别' },
        { id: 'car-006', name: '深静脉血栓形成', summary: '中级病例，抗凝治疗方案选择' },
        { id: 'car-007', name: '感染性心内膜炎', summary: '高级病例，抗生素选择与手术时机' },
    ],
  }), []);

  const cases = selectedDepartment ? allCases[selectedDepartment as keyof typeof allCases] ?? [] : [];

  // 加载历史病例用于侧边栏展示
  interface HistoryCase { id: string; title: string; department?: string; score?: number; finishedAt?: string; durationMinutes?: number; }
  const [historyItems, setHistoryItems] = useState<HistoryCase[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('historyCases');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setHistoryItems(parsed.filter((i: any) => i && i.finishedAt));
      }
    } catch (e) { console.error('读取历史病例失败', e); }
  }, []);
  useEffect(() => {
    const flag = localStorage.getItem('sidebarReturnOpen');
    if (flag === 'true') {
      setShowSidebar(true);
      localStorage.removeItem('sidebarReturnOpen');
    }
  }, []);

  // 新增：滚动检测和滑动提示逻辑
  useEffect(() => {
    const checkScrollHint = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 检查是否需要显示滑动提示（内容超过一屏且用户未滚动到底部）
      const needsScrollHint = documentHeight > windowHeight * 1.2;
      const nearBottom = scrollTop + windowHeight >= documentHeight - 100;
      
      setShowScrollHint(needsScrollHint && !nearBottom);
      setIsNearBottom(nearBottom);
    };

    // 初始检查
    checkScrollHint();
    
    // 添加滚动事件监听
    window.addEventListener('scroll', checkScrollHint);
    window.addEventListener('resize', checkScrollHint);
    
    return () => {
      window.removeEventListener('scroll', checkScrollHint);
      window.removeEventListener('resize', checkScrollHint);
    };
  }, [cases]); // 当病例数据变化时重新检查

  // 新增：清除历史
  const clearHistory = () => {
    localStorage.removeItem('historyCases');
    setHistoryItems([]);
  };

  // 新增：基于时间范围的过滤列表
  const filteredHistoryItems = useMemo(() => {
    const now = Date.now();
    const withinDays = (days: number) => (item: HistoryCase) => {
      const t = item.finishedAt ? new Date(item.finishedAt).getTime() : 0;
      return t >= now - days * 24 * 60 * 60 * 1000;
    };
    if (timeFilter === '7') return historyItems.filter(withinDays(7));
    if (timeFilter === '30') return historyItems.filter(withinDays(30));
    return historyItems;
  }, [historyItems, timeFilter]);

  const stats = useMemo(() => {
    const completed = historyItems.length;
    const scored = historyItems.filter(i => typeof i.score === 'number');
    const avgScore = scored.length ? Math.round(scored.reduce((s, i) => s + (i.score as number), 0) / scored.length) : null;
    const totalMinutes = historyItems.reduce((s, i) => s + (typeof i.durationMinutes === 'number' ? i.durationMinutes : 0), 0);
    return { completed, avgScore, totalMinutes };
  }, [historyItems]);



  const departmentMap: Record<string, string> = {
    '内科': 'internal', '外科': 'surgery', '儿科': 'pediatrics', '妇产科': 'gynecology', '急诊科': 'emergency', '心内科': 'cardiology',
  };
  const openResult = (c: HistoryCase) => {
    navigate(`/result`, { state: { caseId: c.id, title: c.title, department: c.department, fromHistory: true } });
  };

  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * casesPerPage;
    return cases.slice(startIndex, startIndex + casesPerPage);
  }, [cases, currentPage]);

  const totalPages = Math.ceil(cases.length / casesPerPage);

  const handleCaseSelect = (caseItem: any) => {
    navigate(`/consultation/${caseItem.id}`, { state: { caseId: caseItem.id, title: caseItem.name, department: departments.find(d => d.id === selectedDepartment)?.name } });
  }

  return (
    <div className="min-h-screen bg-[#F0F2FF] font-sans">
      {/* 顶部欢迎区域 */}
      <header className="relative bg-gradient-to-b from-[#E6E9FF] to-[#F0F2FF] p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowSidebar(true)} className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
              <span className="text-2xl">☰</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDeptModal(true)} className="px-3 py-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-gray-50 text-sm sm:text-base">
                我的科室{selectedDepartment ? `：${departments.find(d => d.id === selectedDepartment)?.name ?? ''}` : ''}
              </button>
            </div>
          </div>
          <div className="relative flex items-center justify-between h-40 sm:h-48 md:h-52">
            <img src={doc4Image} alt="健康管家" className="absolute bottom-0 left-0 w-48 sm:w-56 md:w-64 lg:w-72 h-auto z-0 mix-blend-multiply" />
            <div className="relative z-10 text-right ml-auto max-w-xs sm:max-w-sm md:max-w-md">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">你好呀, {username}</h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">我是你的病例研习管家</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">开始你的病例研习之旅吧！</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-4 space-y-4 sm:space-y-6">
        {/* 病例推荐 */}
        <section>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">请选择一个病例</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cases.map((item, index) => (
              <div key={item.id} onClick={() => handleCaseSelect(item)} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4">
                <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-base sm:text-lg">{item.name}</h4>
                  <p className="text-gray-500 text-sm mt-1">{item.summary}</p>
                </div>
              </div>
            ))}

            {selectedDepartment && cases.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                该科室暂无病例，请稍后再试。
              </div>
            )}
             {!selectedDepartment && (
              <div className="col-span-full text-center text-gray-500 py-10">
                请先在右上角选择您的科室。
              </div>
            )}
          </div>

          {/* 移除分页，采用向下滑动浏览所有病例 */}
          {/* 分页组件已删除 */}
        </section>
      </main>

      {/* 向下滑动提示 */}
      {showScrollHint && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-200">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-sm text-gray-700 font-medium">向下滑动查看更多病例</span>
          </div>
        </div>
      )}

      {/* 科室选择弹框 */}
      {showDeptModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDeptModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">选择我的科室</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {departments.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDepartment(d.id); localStorage.setItem('selectedDepartment', d.id); setShowDeptModal(false); }}
                  className={`rounded-lg px-3 py-2 text-sm sm:text-base transition ${selectedDepartment === d.id ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setShowDeptModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 左侧侧边栏 */}
      {showSidebar && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSidebar(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl p-4 sm:p-6 overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">{username.slice(0, 1)}</div>
              <div>
                <div className="font-bold text-lg text-gray-800">{username}</div>
                <div className="text-sm text-gray-500">{selectedDepartment ? `科室：${departments.find(d => d.id === selectedDepartment)?.name}` : '未选择科室'}</div>
              </div>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setShowSidebar(false); navigate('/ranking'); }} className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition font-semibold">排行榜</button>
              {/* 已移除历史病例按钮 */}
            </div>
            {/* 病例研习统计模块 */}
            <div className="mt-8">
              <h4 className="text-base font-bold text-gray-800 mb-3">病例研习统计</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">{stats.completed}</div>
                  <div className="text-xs text-gray-600">已完成</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{typeof stats.avgScore === 'number' ? `${stats.avgScore}分` : '-'}</div>
                  <div className="text-xs text-gray-600">平均得分</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">{stats.totalMinutes}</div>
                  <div className="text-xs text-gray-600">研习总时长(分钟)</div>
                </div>

              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-gray-800">病例研习历史</h4>
                <div className="flex items-center gap-2">
                  <div>
                      <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as '7' | '30' | 'all')} className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="7">最近7天</option>
                        <option value="30">最近30天</option>
                        <option value="all">所有时间</option>
                      </select>
                    </div>
                  <button onClick={clearHistory} className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">清空历史</button>
                </div>
              </div>
              {filteredHistoryItems.length === 0 ? (
                <div className="text-xs text-gray-500">暂无病例研习历史</div>
              ) : (
                <div className="space-y-2">
                  {filteredHistoryItems.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition cursor-pointer" onClick={() => openResult(c)}>
                      <div className="font-semibold text-gray-800 text-sm">{c.title}</div>
                      <div className="text-xs text-gray-500 mt-1">科室：{c.department ?? '未知'}</div>
                      {typeof c.score === 'number' && (
                        <div className="text-xs text-gray-600 mt-1">得分：{c.score} 分</div>
                      )}
                      {typeof c.durationMinutes === 'number' && (
                        <div className="text-xs text-gray-600 mt-1">时长：{c.durationMinutes} 分钟</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}