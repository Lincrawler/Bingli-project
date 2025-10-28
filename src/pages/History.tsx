import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HistoryCase {
  id: string;
  title: string;
  department?: string;
  score?: number;
  finishedAt?: string; // ISO string
}

export default function History() {
  const nav = useNavigate();
  const [items, setItems] = useState<HistoryCase[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('historyCases');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      } else {
        // 初始示例数据，便于界面展示
        setItems([
          { id: 'int-001', title: '高血压初诊', department: '内科', score: 88, finishedAt: new Date().toISOString() },
          { id: 'sur-001', title: '阑尾炎术后复查', department: '外科', score: 92, finishedAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    } catch (e) {
      console.error('读取历史病例失败', e);
    }
  }, []);

  const formatted = useMemo(() => (
    items.map(i => ({
      ...i,
      finishedDisplay: i.finishedAt ? new Date(i.finishedAt).toLocaleString() : '未知时间'
    }))
  ), [items]);

  function clearHistory() {
    localStorage.removeItem('historyCases');
    setItems([]);
  }

  function retryCase(c: HistoryCase) {
    if (c.department) localStorage.setItem('selectedDepartment', departmentMap[c.department] ?? c.department);
    nav(`/consultation/${c.id}`);
  }

  const departmentMap: Record<string, string> = {
    '内科': 'internal',
    '外科': 'surgery',
    '儿科': 'pediatrics',
    '妇产科': 'gynecology',
    '急诊科': 'emergency',
    '心内科': 'cardiology',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center">
          <button onClick={() => nav('/')} className="text-gray-600 hover:text-gray-800 p-1.5 sm:p-2 rounded-full hover:bg-gray-100">
            <span className="text-base sm:text-lg">＜</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-lg font-bold text-gray-800">病例研习历史</h1>
             <p className="text-xs text-gray-500">查看已练习的病例记录</p>
          </div>
          <div className="w-6 sm:w-8"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4 flex items-center justify-between">
            <div className="text-sm sm:text-base text-gray-700">共 {items.length} 条记录</div>
            <button onClick={clearHistory} className="text-xs sm:text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">清空历史</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-10">暂无历史病例记录</div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {formatted.map(c => (
              <div key={c.id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-1">科室：{c.department ?? '未知'} · 时间：{c.finishedDisplay}</div>
                    {typeof c.score === 'number' && (
                      <div className="text-xs text-gray-600 mt-1">得分：{c.score} 分</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => retryCase(c)} className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-xs">再次练习</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}