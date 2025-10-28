import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 模拟用户数据
const currentUser = {
  name: '我',
  overallScore: 89,
  overallRank: 5,
  totalCases: 8,
  totalTime: 156, // 分钟
  casesRank: 4, // 研习次数排名
  timeRank: 6, // 研习时长排名
  progressRank: 3, // 进步最快排名
  progressScore: 12, // 本周进步分数
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

// 总研习次数排行榜数据
const casesRanking = [
  { name: '学员A', cases: 15, rank: 1, avgScore: 92 },
  { name: '学员B', cases: 13, rank: 2, avgScore: 88 },
  { name: '学员C', cases: 11, rank: 3, avgScore: 90 },
  { name: '我', cases: 8, rank: 4, avgScore: 89 },
  { name: '学员D', cases: 7, rank: 5, avgScore: 85 },
  { name: '学员F', cases: 6, rank: 6, avgScore: 87 },
  { name: '学员G', cases: 5, rank: 7, avgScore: 84 },
  { name: '学员H', cases: 4, rank: 8, avgScore: 82 },
];

// 总研习时长排行榜数据
const timeRanking = [
  { name: '学员B', time: 280, rank: 1, cases: 13 },
  { name: '学员A', time: 245, rank: 2, cases: 15 },
  { name: '学员C', time: 198, rank: 3, cases: 11 },
  { name: '学员D', time: 175, rank: 4, cases: 7 },
  { name: '学员F', time: 168, rank: 5, cases: 6 },
  { name: '我', time: 156, rank: 6, cases: 8 },
  { name: '学员G', time: 142, rank: 7, cases: 5 },
  { name: '学员H', time: 128, rank: 8, cases: 4 },
];

// 进步最快排行榜数据（基于本周得分提升）
const progressRanking = [
  { name: '学员F', progress: 18, rank: 1, lastWeekScore: 69, currentScore: 87 },
  { name: '学员H', progress: 15, rank: 2, lastWeekScore: 69, currentScore: 84 },
  { name: '我', progress: 12, rank: 3, lastWeekScore: 77, currentScore: 89 },
  { name: '学员G', progress: 10, rank: 4, lastWeekScore: 75, currentScore: 85 },
  { name: '学员D', progress: 8, rank: 5, lastWeekScore: 82, currentScore: 90 },
  { name: '学员C', progress: 5, rank: 6, lastWeekScore: 87, currentScore: 92 },
  { name: '学员B', progress: 3, rank: 7, lastWeekScore: 91, currentScore: 94 },
  { name: '学员A', progress: 2, rank: 8, lastWeekScore: 94, currentScore: 96 },
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
  const [showWeekTip, setShowWeekTip] = useState(false);
  const carouselMessages = [
    '上周 学员A 获得了平均总榜第一',
    '上周 学员B 完成病例数量最多，达到 12 个',
    '上周 我 的平均得分提升至 89 分'
  ];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [listMode, setListMode] = useState<'overall' | 'cases' | 'study-cases' | 'study-time' | 'progress'>('overall');
  const [regionScope, setRegionScope] = useState<'province' | 'city' | 'hospital'>('province');
  // 综合评分环形进度角度（基于 100 分）
  const overallScorePercent = Math.min(100, Math.max(0, currentUser.overallScore));
  const ringAngle = overallScorePercent * 3.6;

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // 如果选择了具体病例，显示该病例的详细排名
  if (selectedCase) {
    const caseResult = currentUser.caseResults.find(c => c.caseId === selectedCase);
    const caseRanking = caseDetailRankings[selectedCase as keyof typeof caseDetailRankings] || [];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center">
            <button onClick={() => setSelectedCase(null)} className="p-2 rounded-md hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
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
                {caseRanking.length > 0 ? (
                  caseRanking.map((user) => (
                    <div key={user.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${user.name === '我' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                          {user.rank}
                        </div>
                        <span className={`text-sm sm:text-base ${user.name === '我' ? 'font-bold text-gray-800' : 'text-gray-700'}`}>{user.name}</span>
                      </div>
                      <div className="text-blue-500 font-semibold text-sm sm:text-base">{user.score}分</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                    该病例暂无完整排名数据
                  </div>
                )}
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
          <button onClick={() => { localStorage.setItem('sidebarReturnOpen', 'true'); nav(-1); }} className="p-2 rounded-md hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-lg font-bold text-gray-800">排行榜</h1>
          </div>
          <div className="w-6 sm:w-8"></div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 轮播消息 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-100">
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-blue-600">最新动态</span>
              <span aria-live="polite" className="text-xs text-gray-800">
                {carouselMessages[carouselIndex]}
              </span>
            </div>
          </div>
        </div>

        {/* 我的综合评分（重排） */}
        <div className="bg-white rounded-lg shadow-sm text-center relative">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 relative">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">我的综合评分</h2>
              <button
                type="button"
                aria-label="榜单说明"
                onClick={() => setShowWeekTip((s) => !s)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center text-xs border border-gray-300 select-none"
              >
                ?
              </button>
              {showWeekTip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left w-[22rem] sm:w-[26rem]">
                  <div className="text-[11px] sm:text-xs text-gray-700 leading-snug tracking-tight">
                    默认周榜，每周一 0 点更新，统计前 7 天的有效分数，周一 0 点清零重置。
                  </div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                </div>
              )}
            </div>

            {/* 环形进度显示平均得分 */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="relative" style={{ width: '160px', height: '160px' }}>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundImage: `conic-gradient(from 0deg, #3b82f6 0deg, #22d3ee ${ringAngle}deg, #e5e7eb ${ringAngle}deg 360deg)` }}
                ></div>
                <div className="absolute inset-0 m-3 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-gray-900">{currentUser.overallScore}</div>
                    <div className="text-xs text-gray-500">分</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 下方三项指标 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-lg sm:text-xl font-bold text-blue-500 mb-1">#{currentUser.overallRank}</div>
                <div className="text-xs sm:text-sm text-gray-600">当前排名</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-purple-500 mb-1">{currentUser.totalCases}</div>
                <div className="text-xs sm:text-sm text-gray-600">研习次数</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-indigo-500 mb-1">{currentUser.totalTime}</div>
                <div className="text-xs sm:text-sm text-gray-600">研习总时长(分钟)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 排行榜类型切换标签页 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-2 sm:p-3">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  listMode === 'overall' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setListMode('overall')}
              >
                综合排行
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  listMode === 'study-cases' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setListMode('study-cases')}
              >
                研习次数
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  listMode === 'study-time' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setListMode('study-time')}
              >
                研习时长
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  listMode === 'progress' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setListMode('progress')}
              >
                进步最快
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  listMode === 'cases' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setListMode('cases')}
              >
                我的成绩
              </button>
            </div>
          </div>
        </div>

        {/* 我的研习成绩列表（仅在选择"我的研习成绩"时显示） */}
        {listMode === 'cases' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">我的研习成绩</h3>
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
        )}

        {/* 综合排行榜 */}
        {listMode === 'overall' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">综合排行榜</h3>
                {/* 地区范围选择 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">地区范围</span>
                  <div className="inline-flex rounded-full bg-gray-100 p-1">
                    {(['province','city','hospital'] as const).map(key => (
                      <button
                        key={key}
                        onClick={() => setRegionScope(key)}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${regionScope === key ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-white'}`}
                      >
                        {key === 'province' ? '本省' : key === 'city' ? '本市' : '本医院'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
        )}

        {/* 总研习次数排行榜 */}
        {listMode === 'study-cases' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">总研习次数排行榜</h3>
                <div className="text-xs sm:text-sm text-gray-600">我的排名: #{currentUser.casesRank}</div>
              </div>
              <div className="text-xs text-gray-600 mb-2 sm:mb-3">
                按照完成病例总数排序，展示学习积极性
              </div>
              <div className="space-y-2 sm:space-y-3">
                {casesRanking.map((user) => (
                  <div key={user.name} className="flex justify-between items-center py-2 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${user.name === '我' ? 'bg-purple-600' : 'bg-purple-400'}`}>
                        {user.rank}
                      </div>
                      <div>
                        <div className={`font-bold text-sm sm:text-base ${user.name === '我' ? 'text-gray-800' : 'text-gray-700'}`}>{user.name}</div>
                        <div className="text-xs text-gray-500">平均得分 {user.avgScore} 分</div>
                      </div>
                    </div>
                    <div className="text-purple-500 font-bold text-base sm:text-lg">{user.cases} 次</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 总研习时长排行榜 */}
        {listMode === 'study-time' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">总研习时长排行榜</h3>
                <div className="text-xs sm:text-sm text-gray-600">我的排名: #{currentUser.timeRank}</div>
              </div>
              <div className="text-xs text-gray-600 mb-2 sm:mb-3">
                按照累计研习时长排序，体现学习投入度
              </div>
              <div className="space-y-2 sm:space-y-3">
                {timeRanking.map((user) => (
                  <div key={user.name} className="flex justify-between items-center py-2 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${user.name === '我' ? 'bg-indigo-600' : 'bg-indigo-400'}`}>
                        {user.rank}
                      </div>
                      <div>
                        <div className={`font-bold text-sm sm:text-base ${user.name === '我' ? 'text-gray-800' : 'text-gray-700'}`}>{user.name}</div>
                        <div className="text-xs text-gray-500">完成病例 {user.cases} 个</div>
                      </div>
                    </div>
                    <div className="text-indigo-500 font-bold text-base sm:text-lg">{user.time} 分钟</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 进步最快排行榜 */}
        {listMode === 'progress' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">进步最快排行榜</h3>
                <div className="text-xs sm:text-sm text-gray-600">我的排名: #{currentUser.progressRank}</div>
              </div>
              <div className="text-xs text-gray-600 mb-2 sm:mb-3">
                按照本周得分提升幅度排序，鼓励持续进步
              </div>
              <div className="space-y-2 sm:space-y-3">
                {progressRanking.map((user) => (
                  <div key={user.name} className="flex justify-between items-center py-2 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${user.name === '我' ? 'bg-green-600' : 'bg-green-400'}`}>
                        {user.rank}
                      </div>
                      <div>
                        <div className={`font-bold text-sm sm:text-base ${user.name === '我' ? 'text-gray-800' : 'text-gray-700'}`}>{user.name}</div>
                        <div className="text-xs text-gray-500">{user.lastWeekScore}→{user.currentScore} 分</div>
                      </div>
                    </div>
                    <div className="text-green-500 font-bold text-base sm:text-lg">+{user.progress} 分</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}