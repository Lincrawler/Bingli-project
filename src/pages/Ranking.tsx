import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 模拟用户数据
const currentUser = {
  name: '我',
  overallScore: 89,
  overallRank: 5,
  totalCases: 8,
  totalTime: 156, // 分钟
  caseResults: [
    { caseId: 'case-internal-1', caseName: '病例A：发热伴咳嗽', score: 92, rank: 3, totalUsers: 15 },
    { caseId: 'case-internal-2', caseName: '病例B：胸痛伴气促', score: 88, rank: 7, totalUsers: 12 },
    { caseId: 'case-surgery-1', caseName: '病例D：急性阑尾炎', score: 95, rank: 1, totalUsers: 18 },
    { caseId: 'case-pediatrics-1', caseName: '病例F：小儿发热', score: 85, rank: 8, totalUsers: 14 },
    { caseId: 'case-emergency-1', caseName: '病例J：急性胸痛', score: 90, rank: 4, totalUsers: 16 }
  ]
};

// 全体排行榜数据
const overallRanking = [
  { name: '学员A', score: 96, cases: 12, rank: 1 },
  { name: '学员B', score: 94, cases: 11, rank: 2 },
  { name: '学员C', score: 92, cases: 10, rank: 3 },
  { name: '学员D', score: 90, cases: 9, rank: 4 },
  { name: '我', score: 89, cases: 8, rank: 5 },
  { name: '学员F', score: 87, cases: 8, rank: 6 },
  { name: '学员G', score: 85, cases: 8, rank: 7 },
  { name: '学员H', score: 84, cases: 7, rank: 8 },
];

// 病例详细排名数据
const caseDetailRankings = {
  'case-internal-1': [
    { name: '学员C', score: 98, rank: 1 },
    { name: '学员A', score: 95, rank: 2 },
    { name: '我', score: 92, rank: 3 },
    { name: '学员B', score: 90, rank: 4 },
    { name: '学员D', score: 88, rank: 5 }
  ],
  'case-surgery-1': [
    { name: '我', score: 95, rank: 1 },
    { name: '学员A', score: 93, rank: 2 },
    { name: '学员B', score: 91, rank: 3 }
  ]
  // 其他病例的排名数据...
};

export default function Ranking() {
  const nav = useNavigate();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // 如果选择了具体病例，显示该病例的详细排名
  if (selectedCase) {
    const caseResult = currentUser.caseResults.find(c => c.caseId === selectedCase);
    const caseRanking = caseDetailRankings[selectedCase as keyof typeof caseDetailRankings] || [];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center">
            <button onClick={() => setSelectedCase(null)} className="text-gray-600 hover:text-gray-800 p-1.5 sm:p-2 rounded-full hover:bg-gray-100">
              <span className="text-base sm:text-lg">＜</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-base sm:text-lg font-bold text-gray-800">病例排名详情</h1>
              <p className="text-xs text-gray-500">{caseResult?.caseName}</p>
            </div>
            <div className="w-6 sm:w-8"></div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm text-center">
            <div className="p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">我的成绩</h2>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-500 mb-1">{caseResult?.score}分</div>
                  <div className="text-xs sm:text-sm text-gray-600">我的得分</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-orange-500 mb-1">#{caseResult?.rank}</div>
                  <div className="text-xs sm:text-sm text-gray-600">我的排名</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-600 mb-1">{caseResult?.totalUsers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">总参与人数</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">完整排名</h3>
              <div className="space-y-2 sm:space-y-3">
                {caseRanking.map((user) => (
                  <div key={user.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${user.name === '我' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                        {user.rank}
                      </div>
                      <span className={`text-sm sm:text-base ${user.name === '我' ? 'font-bold text-gray-800' : 'text-gray-700'}`}>{user.name}</span>
                    </div>
                    <div className="text-blue-500 font-semibold text-sm sm:text-base">{user.score}分</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 主排行榜页面
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center">
          <button onClick={() => { localStorage.setItem('sidebarReturnOpen', 'true'); nav(-1); }} className="text-gray-600 hover:text-gray-800 p-1.5 sm:p-2 rounded-full hover:bg-gray-100">
            <span className="text-base sm:text-lg">＜</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-lg font-bold text-gray-800">排行榜</h1>
          </div>
          <div className="w-6 sm:w-8"></div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 我的综合排名 */}
        <div className="bg-white rounded-lg shadow-sm text-center">
          <div className="p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">我的综合排名</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1">#{currentUser.overallRank}</div>
                <div className="text-xs sm:text-sm text-gray-600">当前排名</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">{currentUser.overallScore}分</div>
                <div className="text-xs sm:text-sm text-gray-600">平均得分</div>
              </div>
            </div>
          </div>
        </div>

        {/* 总览信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">总览信息</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-blue-500 mb-1">{currentUser.totalCases}</div>
                <div className="text-xs sm:text-sm text-gray-600">诊断次数</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-500 mb-1">{currentUser.totalTime}</div>
                <div className="text-xs sm:text-sm text-gray-600">诊断总时长(分钟)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 我的病例排名列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">我的病例成绩</h3>
            <div className="space-y-2 sm:space-y-3">
              {currentUser.caseResults.map((caseResult) => (
                <div
                  key={caseResult.caseId}
                  onClick={() => setSelectedCase(caseResult.caseId)}
                  className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm sm:text-base">{caseResult.caseName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        排名 #{caseResult.rank} / {caseResult.totalUsers}人
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-blue-500">{caseResult.score}分</div>
                      <div className="text-xs text-gray-500">点击查看详情</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 综合排行榜 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">综合排行榜</h3>
            <div className="text-xs text-gray-600 mb-2 sm:mb-3">
              依据研习完成度、信息采集完整性、分析合理性与验证结果匹配度综合得分
            </div>
            <div className="space-y-2 sm:space-y-3">
              {overallRanking.map((user) => (
                <div key={user.name} className="flex justify-between items-center py-2 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${user.name === '我' ? 'bg-blue-600' : 'bg-blue-400'}`}>
                      {user.rank}
                    </div>
                    <div>
                      <div className={`font-bold text-sm sm:text-base ${user.name === '我' ? 'text-gray-800' : 'text-gray-700'}`}>{user.name}</div>
                      <div className="text-xs text-gray-500">完成病例 {user.cases} 个</div>
                    </div>
                  </div>
                  <div className="text-blue-500 font-bold text-base sm:text-lg">{user.score} 分</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}