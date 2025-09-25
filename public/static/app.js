const { useState, useEffect, useRef } = React;

// 간단한 한자-병음 매핑 (확장 가능)
const chinesePinyinMap = {
  "你": "nǐ", "好": "hǎo", "你好": "nǐ hǎo",
  "谢": "xiè", "谢谢": "xiè xiè",
  "再": "zài", "见": "jiàn", "再见": "zài jiàn",
  "对": "duì", "不": "bù", "起": "qǐ", "对不起": "duì bù qǐ",
  "没": "méi", "关": "guān", "系": "xì", "没关系": "méi guān xì",
  "一": "yī", "二": "èr", "三": "sān", "四": "sì", "五": "wǔ",
  "六": "liù", "七": "qī", "八": "bā", "九": "jiǔ", "十": "shí",
  "爸": "bà", "爸爸": "bà ba",
  "妈": "mā", "妈妈": "mā ma", 
  "哥": "gē", "哥哥": "gē ge",
  "弟": "dì", "弟弟": "dì di",
  "姐": "jiě", "姐姐": "jiě jie",
  "妹": "mèi", "妹妹": "mèi mei",
  "学": "xué", "习": "xí", "学习": "xué xí",
  "汉": "hàn", "语": "yǔ", "汉语": "hàn yǔ",
  "中": "zhōng", "国": "guó", "中国": "zhōng guó",
  "老": "lǎo", "师": "shī", "老师": "lǎo shī",
  "学": "xué", "生": "shēng", "学生": "xué shēng"
};

// 병음 추천 함수
function getPinyinSuggestion(chinese) {
  return chinesePinyinMap[chinese] || '';
}

// 메인 앱 컴포넌트
function ChinesePinyinApp() {
  const [currentView, setCurrentView] = useState('selector'); // 'selector' | 'activity'
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // 모든 액티비티 목록 로드
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error('액티비티 목록 로드 실패:', err));
  }, []);

  const startActivity = (activityId) => {
    setSelectedActivityId(activityId);
    setCurrentView('activity');
  };

  const backToSelector = () => {
    setCurrentView('selector');
    setSelectedActivityId(null);
  };

  if (currentView === 'selector') {
    return <ActivitySelector activities={activities} onStartActivity={startActivity} />;
  }

  return <ChinesePinyinActivity activityId={selectedActivityId} onBack={backToSelector} />;
}

// 액티비티 선택 컴포넌트
function ActivitySelector({ activities, onStartActivity }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          중국어 한자 병음 매칭 액티비티
        </h1>
        <p className="text-center text-gray-600 mb-8">
          한자와 병음을 드래그앤드랍으로 연결해보세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2 chinese-character">
                {activity.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {activity.description}
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <div>총 {activity.characters.length}개 문제</div>
                {activity.settings.timeLimit > 0 && (
                  <div>제한시간: {Math.floor(activity.settings.timeLimit / 60)}분</div>
                )}
              </div>
              
              {/* 미리보기 한자들 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {activity.characters.slice(0, 5).map((char) => (
                  <span key={char.id} className="chinese-character text-lg bg-white px-2 py-1 rounded">
                    {char.chinese}
                  </span>
                ))}
                {activity.characters.length > 5 && (
                  <span className="text-gray-400">...</span>
                )}
              </div>

              <button
                onClick={() => onStartActivity(activity.id)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                시작하기
              </button>
            </div>
          ))}
        </div>

        {/* 커스텀 액티비티 만들기 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => onStartActivity('custom')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + 새 액티비티 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

// 드래그앤드랍 액티비티 메인 컴포넌트
function ChinesePinyinActivity({ activityId, onBack }) {
  const [activityData, setActivityData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  useEffect(() => {
    // 액티비티 데이터 로드
    const loadActivity = () => {
      if (activityId === 'custom') {
        // 커스텀 액티비티는 편집 모드로 시작
        setActivityData({
          id: 'custom',
          title: '새 액티비티',
          description: '새로운 중국어 학습 액티비티',
          characters: [],
          settings: {
            chineseFontSize: 48,
            pinyinFontSize: 24,
            gridColumns: 5,
            spacing: 20,
            showMeaning: true,
            dragDirection: "both",
            timeLimit: 0,
            shuffleItems: true
          }
        });
        setIsEditing(true);
      } else {
        fetch(`/api/activities/${activityId}`)
          .then(res => res.json())
          .then(data => {
            setActivityData(data);
            if (data.settings.timeLimit > 0) {
              setTimeLeft(data.settings.timeLimit);
            }
          })
          .catch(err => console.error('데이터 로드 실패:', err));
      }
    };
    
    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  // 타이머 효과
  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 시간 종료
            setIsStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId, targetType) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // 올바른 매칭인지 확인
    const targetChar = activityData.characters.find(char => char.id === targetId);
    let isCorrect = false;
    
    if (targetType === 'chinese' && draggedItem.type === 'pinyin') {
      isCorrect = targetChar && targetChar.pinyin === draggedItem.pinyin;
    } else if (targetType === 'pinyin' && draggedItem.type === 'chinese') {
      isCorrect = targetChar && targetChar.chinese === draggedItem.chinese;
    }
    
    // 답안 저장
    setUserAnswers(prev => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        [targetType]: draggedItem
      }
    }));
    
    // 피드백 저장
    setFeedback(prev => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        [targetType]: isCorrect ? 'correct' : 'incorrect'
      }
    }));
  };

  const resetActivity = () => {
    setUserAnswers({});
    setFeedback({});
    setIsStarted(false);
    if (activityData?.settings.timeLimit > 0) {
      setTimeLeft(activityData.settings.timeLimit);
    }
  };

  const startTimer = () => {
    setIsStarted(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!activityData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              ← 뒤로
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{activityData.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {activityData.settings.timeLimit > 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                  ⏰ {formatTime(timeLeft)}
                </span>
                {!isStarted && timeLeft > 0 && (
                  <button
                    onClick={startTimer}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                  >
                    시작
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {isEditing ? '편집 완료' : '설정 편집'}
              </button>
              <button
                onClick={resetActivity}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                다시 시작
              </button>
            </div>
          </div>
        </div>

        {isEditing && <SettingsPanel activityData={activityData} setActivityData={setActivityData} />}
        
        <ActivityBoard 
          activityData={activityData}
          userAnswers={userAnswers}
          feedback={feedback}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        
        <ScoreDisplay activityData={activityData} feedback={feedback} />
      </div>
    </div>
  );
}

// 설정 패널 컴포넌트
function SettingsPanel({ activityData, setActivityData }) {
  const [newCharacter, setNewCharacter] = useState({ chinese: '', pinyin: '', meaning: '' });
  
  const updateSettings = (key, value) => {
    setActivityData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const addCharacter = () => {
    if (newCharacter.chinese && newCharacter.pinyin) {
      const newId = Math.max(...activityData.characters.map(c => c.id)) + 1;
      setActivityData(prev => ({
        ...prev,
        characters: [...prev.characters, { ...newCharacter, id: newId }]
      }));
      setNewCharacter({ chinese: '', pinyin: '', meaning: '' });
    }
  };

  const removeCharacter = (id) => {
    setActivityData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id)
    }));
  };

  const applyTemplate = (templateName) => {
    const templates = {
      basic: {
        chineseFontSize: 48,
        pinyinFontSize: 24,
        gridColumns: 5,
        spacing: 20,
        showMeaning: true,
        dragDirection: "both",
        timeLimit: 0,
        shuffleItems: true
      },
      compact: {
        chineseFontSize: 36,
        pinyinFontSize: 18,
        gridColumns: 6,
        spacing: 15,
        showMeaning: false,
        dragDirection: "pinyin-to-chinese",
        timeLimit: 180,
        shuffleItems: true
      },
      large: {
        chineseFontSize: 60,
        pinyinFontSize: 30,
        gridColumns: 4,
        spacing: 30,
        showMeaning: true,
        dragDirection: "both",
        timeLimit: 0,
        shuffleItems: false
      }
    };

    if (templates[templateName]) {
      setActivityData(prev => ({
        ...prev,
        settings: { ...prev.settings, ...templates[templateName] }
      }));
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">액티비티 설정</h3>
      
      {/* 레이아웃 및 스타일 설정 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            한자 폰트 크기: {activityData.settings.chineseFontSize}px
          </label>
          <input
            type="range"
            min="24"
            max="72"
            value={activityData.settings.chineseFontSize}
            onChange={(e) => updateSettings('chineseFontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            병음 폰트 크기: {activityData.settings.pinyinFontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="36"
            value={activityData.settings.pinyinFontSize}
            onChange={(e) => updateSettings('pinyinFontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            간격: {activityData.settings.spacing}px
          </label>
          <input
            type="range"
            min="10"
            max="50"
            value={activityData.settings.spacing}
            onChange={(e) => updateSettings('spacing', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            열 개수: {activityData.settings.gridColumns}
          </label>
          <input
            type="range"
            min="3"
            max="8"
            value={activityData.settings.gridColumns}
            onChange={(e) => updateSettings('gridColumns', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* 액티비티 옵션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-medium">액티비티 옵션</h4>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={activityData.settings.showMeaning}
              onChange={(e) => updateSettings('showMeaning', e.target.checked)}
              className="mr-2"
            />
            한국어 뜻 표시
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={activityData.settings.shuffleItems}
              onChange={(e) => updateSettings('shuffleItems', e.target.checked)}
              className="mr-2"
            />
            문제 순서 섞기
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              드래그 방향
            </label>
            <select
              value={activityData.settings.dragDirection}
              onChange={(e) => updateSettings('dragDirection', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="both">양방향 (한자↔병음)</option>
              <option value="pinyin-to-chinese">병음 → 한자</option>
              <option value="chinese-to-pinyin">한자 → 병음</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제한시간 (초, 0=무제한): {activityData.settings.timeLimit}
            </label>
            <input
              type="range"
              min="0"
              max="600"
              step="30"
              value={activityData.settings.timeLimit}
              onChange={(e) => updateSettings('timeLimit', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">빠른 템플릿 적용</h4>
          <div className="space-y-2">
            <button
              onClick={() => applyTemplate('basic')}
              className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              기본 설정
            </button>
            <button
              onClick={() => applyTemplate('compact')}
              className="w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
            >
              컴팩트 설정
            </button>
            <button
              onClick={() => applyTemplate('large')}
              className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
            >
              대형 설정
            </button>
          </div>
        </div>
      </div>

      {/* 새 한자 추가 */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">새 한자 추가</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="한자"
            value={newCharacter.chinese}
            onChange={(e) => {
              const value = e.target.value;
              setNewCharacter(prev => ({ ...prev, chinese: value }));
              // 한자 입력 시 자동 병음 추천 (간단한 예시)
              if (value && !newCharacter.pinyin) {
                const pinyinSuggestion = getPinyinSuggestion(value);
                if (pinyinSuggestion) {
                  setNewCharacter(prev => ({ ...prev, pinyin: pinyinSuggestion }));
                }
              }
            }}
            className="px-3 py-2 border rounded chinese-character text-lg"
          />
          <input
            type="text"
            placeholder="병음"
            value={newCharacter.pinyin}
            onChange={(e) => setNewCharacter(prev => ({ ...prev, pinyin: e.target.value }))}
            className="px-3 py-2 border rounded pinyin-text"
          />
          <input
            type="text"
            placeholder="뜻"
            value={newCharacter.meaning}
            onChange={(e) => setNewCharacter(prev => ({ ...prev, meaning: e.target.value }))}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={addCharacter}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            추가
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          💡 팁: 한자를 입력하면 자동으로 병음이 추천됩니다
        </div>
      </div>

      {/* 기존 한자 관리 */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-3">기존 한자 관리</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {activityData.characters.map((char) => (
            <div key={char.id} className="flex items-center justify-between bg-white p-2 rounded">
              <div className="flex items-center gap-4">
                <span className="chinese-character text-lg">{char.chinese}</span>
                <span className="pinyin-text text-sm">{char.pinyin}</span>
                <span className="text-sm text-gray-600">{char.meaning}</span>
              </div>
              <button
                onClick={() => removeCharacter(char.id)}
                className="text-red-500 hover:text-red-700 px-2 py-1"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 활동 보드 컴포넌트
function ActivityBoard({ activityData, userAnswers, feedback, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const { characters, settings } = activityData;
  
  // 한자와 병음을 섞어서 표시 (설정에 따라)
  const shuffledChinese = settings.shuffleItems 
    ? [...characters].sort(() => Math.random() - 0.5)
    : characters;
  const shuffledPinyin = settings.shuffleItems 
    ? [...characters].sort(() => Math.random() - 0.5) 
    : characters;

  return (
    <div className="space-y-8">
      {/* 중국어 한자 영역 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">중국어 한자</h3>
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
            gap: `${settings.spacing}px`
          }}
        >
          {shuffledChinese.map((char) => (
            <ChineseCharacterCard
              key={`chinese-${char.id}`}
              character={char}
              fontSize={settings.chineseFontSize}
              userAnswer={userAnswers[char.id]?.chinese}
              feedback={feedback[char.id]?.chinese}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      </div>

      {/* 병음 영역 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">병음 (Pinyin)</h3>
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
            gap: `${settings.spacing}px`
          }}
        >
          {shuffledPinyin.map((char) => (
            <PinyinCard
              key={`pinyin-${char.id}`}
              character={char}
              fontSize={settings.pinyinFontSize}
              userAnswer={userAnswers[char.id]?.pinyin}
              feedback={feedback[char.id]?.pinyin}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 중국어 한자 카드 컴포넌트
function ChineseCharacterCard({ character, fontSize, userAnswer, feedback, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const getFeedbackClass = () => {
    if (feedback === 'correct') return 'correct';
    if (feedback === 'incorrect') return 'incorrect';
    return '';
  };

  return (
    <div className="relative">
      <div
        className={`bg-white border-2 rounded-lg p-4 text-center chinese-character drop-zone ${getFeedbackClass()}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, character.id, 'chinese')}
        style={{ minHeight: '120px' }}
      >
        <div style={{ fontSize: `${fontSize}px` }} className="font-bold mb-2">
          {character.chinese}
        </div>
        <div className="text-sm text-gray-600">{character.meaning}</div>
        
        {/* 드롭된 병음 표시 */}
        {userAnswer && (
          <div className="mt-2 p-2 bg-blue-100 rounded text-sm pinyin-text">
            {userAnswer.pinyin}
          </div>
        )}
      </div>
    </div>
  );
}

// 병음 카드 컴포넌트  
function PinyinCard({ character, fontSize, userAnswer, feedback, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const getFeedbackClass = () => {
    if (feedback === 'correct') return 'correct';
    if (feedback === 'incorrect') return 'incorrect';
    return '';
  };

  return (
    <div className="relative">
      <div
        className={`bg-white border-2 rounded-lg p-4 text-center drop-zone ${getFeedbackClass()}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, character.id, 'pinyin')}
        style={{ minHeight: '120px' }}
      >
        <div 
          className={`pinyin-text font-semibold mb-2 drag-item ${userAnswer ? 'opacity-50' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
          draggable={!userAnswer}
          onDragStart={(e) => onDragStart(e, character, 'pinyin')}
          onDragEnd={onDragEnd}
        >
          {character.pinyin}
        </div>
        
        {/* 드롭된 한자 표시 */}
        {userAnswer && (
          <div className="mt-2 p-2 bg-green-100 rounded chinese-character text-lg">
            {userAnswer.chinese}
          </div>
        )}
      </div>
    </div>
  );
}

// 점수 표시 컴포넌트
function ScoreDisplay({ activityData, feedback }) {
  const totalQuestions = activityData.characters.length * 2; // 한자->병음, 병음->한자
  const correctAnswers = Object.values(feedback).reduce((count, charFeedback) => {
    if (charFeedback.chinese === 'correct') count++;
    if (charFeedback.pinyin === 'correct') count++;
    return count;
  }, 0);
  
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-2">
          점수: {correctAnswers} / {totalQuestions} ({percentage}%)
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// 메인 앱 렌더링
ReactDOM.render(<ChinesePinyinApp />, document.getElementById('root'));