import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cases() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState<string | null>(null);

  useEffect(() => {
    const savedDept = localStorage.getItem('selectedDepartment');
    setDepartment(savedDept);
  }, []);

  const allCases = useMemo(() => ({
    internal: [
      { id: 'int-001', title: '高血压初诊', level: '初级' },
      { id: 'int-002', title: '糖尿病随访', level: '中级' },
    ],
    surgery: [
      { id: 'sur-001', title: '阑尾炎术后复查', level: '初级' },
      { id: 'sur-002', title: '疝气门诊评估', level: '中级' },
    ],
    pediatrics: [
      { id: 'ped-001', title: '小儿发热问诊', level: '初级' },
      { id: 'ped-002', title: '咳嗽迁延评估', level: '中级' },
    ],
    gynecology: [
      { id: 'gyn-001', title: '孕早期保健', level: '初级' },
      { id: 'gyn-002', title: '产后复查', level: '中级' },
    ],
    emergency: [
      { id: 'eme-001', title: '胸痛急诊处置', level: '高级' },
      { id: 'eme-002', title: '外伤初步评估', level: '中级' },
    ],
    cardiology: [
      { id: 'car-001', title: '心绞痛门诊', level: '中级' },
      { id: 'car-002', title: '心衰复诊', level: '高级' },
    ],
  }), []);

  const cases = department ? allCases[department as keyof typeof allCases] ?? [] : [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">病例列表</h2>
        <button className="text-sm text-blue-600 hover:underline" onClick={() => navigate('/')}>返回首页</button>
      </div>

      {!department && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 mb-4">
          未选择科室，请到首页点击“我的科室”进行选择。
        </div>
      )}

      {department && (
        <div className="mb-3 text-gray-600">当前科室：{department}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cases.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/consultation/${c.id}`)}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800">{c.title}</div>
              <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{c.level}</div>
            </div>
            <div className="text-sm text-gray-600">点击进入病例问诊</div>
          </div>
        ))}
        {department && cases.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">该科室暂无病例，请稍后再试。</div>
        )}
      </div>
    </div>
  );
}