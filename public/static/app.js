const { useState, useEffect } = React;
const { createElement: h } = React;

// 간단한 한자-병음 매핑
const chinesePinyinMap = {
  "你": "nǐ", "好": "hǎo", "你好": "nǐ hǎo",
  "谢": "xiè", "谢谢": "xiè xiè",
  "재": "zài", "见": "jiàn", "再见": "zài jiàn",
  "对": "duì", "不": "bù", "起": "qǐ", "对不起": "duì bù qǐ",
  "没": "méi", "关": "guān", "系": "xì", "没关系": "méi guān xì",
  "一": "yī", "二": "èr", "三": "sān", "四": "sì", "五": "wǔ",
  "六": "liù", "七": "qī", "八": "bā", "九": "jiǔ", "十": "shí"
};

// 병음 추천 함수
function getPinyinSuggestion(chinese) {
  return chinesePinyinMap[chinese] || '';
}

// 메인 앱 컴포넌트
function ChinesePinyinApp() {
  const [currentView, setCurrentView] = useState('selector');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
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
    return h(ActivitySelector, { activities, onStartActivity: startActivity });
  }

  return h(ChinesePinyinActivity, { activityId: selectedActivityId, onBack: backToSelector });
}

// 액티비티 선택 컴포넌트
function ActivitySelector({ activities, onStartActivity }) {
  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    h('div', { className: 'bg-white rounded-lg shadow-lg p-8' },
      h('h1', { className: 'text-3xl font-bold text-center text-gray-800 mb-2' },
        '중국어 한자 병음 매칭 액티비티'
      ),
      h('p', { className: 'text-center text-gray-600 mb-8' },
        '한자와 병음을 드래그앤드랍으로 연결해보세요'
      ),
      h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        ...activities.map(activity =>
          h('div', { key: activity.id, className: 'bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow' },
            h('h3', { className: 'text-xl font-semibold mb-2 chinese-character' }, activity.title),
            h('p', { className: 'text-gray-600 text-sm mb-4' }, activity.description),
            h('div', { className: 'text-sm text-gray-500 mb-4' },
              h('div', null, `총 ${activity.characters.length}개 문제`),
              activity.settings.timeLimit > 0 && h('div', null, `제한시간: ${Math.floor(activity.settings.timeLimit / 60)}분`)
            ),
            h('div', { className: 'flex flex-wrap gap-2 mb-4' },
              ...activity.characters.slice(0, 5).map(char =>
                h('span', { key: char.id, className: 'chinese-character text-lg bg-white px-2 py-1 rounded' }, char.chinese)
              ),
              activity.characters.length > 5 && h('span', { className: 'text-gray-400' }, '...')
            ),
            h('button', {
              onClick: () => onStartActivity(activity.id),
              className: 'w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            }, '시작하기')
          )
        )
      ),
      h('div', { className: 'mt-8 text-center' },
        h('button', {
          onClick: () => onStartActivity('custom'),
          className: 'px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
        }, '+ 새 액티비티 만들기')
      )
    )
  );
}

// 드래그앤드랍 액티비티 메인 컴포넌트
function ChinesePinyinActivity({ activityId, onBack }) {
  const [activityData, setActivityData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  
  useEffect(() => {
    if (activityId === 'custom') {
      setActivityData({
        id: 'custom',
        title: '새 액티비티',
        description: '새로운 중국어 학습 액티비티',
        characters: [],
        settings: {
          chineseFontSize: 48, pinyinFontSize: 24, gridColumns: 5, spacing: 20,
          showMeaning: true, dragDirection: "both", timeLimit: 0, shuffleItems: true
        }
      });
      setIsEditing(true);
    } else {
      fetch(`/api/activities/${activityId}`)
        .then(res => res.json())
        .then(data => setActivityData(data))
        .catch(err => console.error('데이터 로드 실패:', err));
    }
  }, [activityId]);

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
    
    const targetChar = activityData.characters.find(char => char.id === targetId);
    let isCorrect = false;
    
    if (targetType === 'chinese' && draggedItem.type === 'pinyin') {
      isCorrect = targetChar && targetChar.pinyin === draggedItem.pinyin;
    } else if (targetType === 'pinyin' && draggedItem.type === 'chinese') {
      isCorrect = targetChar && targetChar.chinese === draggedItem.chinese;
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        [targetType]: draggedItem
      }
    }));
    
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
  };

  if (!activityData) {
    return h('div', { className: 'flex justify-center items-center h-64' },
      h('div', { className: 'text-gray-500' }, '로딩 중...')
    );
  }

  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    h('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
      h('div', { className: 'flex justify-between items-center mb-4' },
        h('div', { className: 'flex items-center gap-4' },
          h('button', {
            onClick: onBack,
            className: 'px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition'
          }, '← 뒤로'),
          h('h1', { className: 'text-2xl font-bold text-gray-800' }, activityData.title)
        ),
        h('div', { className: 'flex gap-2' },
          h('button', {
            onClick: () => setIsEditing(!isEditing),
            className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
          }, isEditing ? '편집 완료' : '설정 편집'),
          h('button', {
            onClick: resetActivity,
            className: 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition'
          }, '다시 시작')
        )
      ),
      
      isEditing && h(SettingsPanel, { activityData, setActivityData }),
      
      h(ActivityBoard, {
        activityData,
        userAnswers,
        feedback,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragOver: handleDragOver,
        onDrop: handleDrop
      }),
      
      h(ScoreDisplay, { activityData, feedback })
    )
  );
}

// 설정 패널 컴포넌트
function SettingsPanel({ activityData, setActivityData }) {
  const [newCharacter, setNewCharacter] = useState({ chinese: '', pinyin: '', meaning: '' });
  
  const updateSettings = (key, value) => {
    setActivityData(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  const addCharacter = () => {
    if (newCharacter.chinese && newCharacter.pinyin) {
      const newId = Math.max(...activityData.characters.map(c => c.id), 0) + 1;
      setActivityData(prev => ({
        ...prev,
        characters: [...prev.characters, { ...newCharacter, id: newId }]
      }));
      setNewCharacter({ chinese: '', pinyin: '', meaning: '' });
    }
  };

  return h('div', { className: 'bg-gray-50 rounded-lg p-4 mb-6' },
    h('h3', { className: 'text-lg font-semibold mb-4' }, '액티비티 설정'),
    h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6' },
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `한자 폰트 크기: ${activityData.settings.chineseFontSize}px`
        ),
        h('input', {
          type: 'range',
          min: 24, max: 72,
          value: activityData.settings.chineseFontSize,
          onChange: (e) => updateSettings('chineseFontSize', parseInt(e.target.value)),
          className: 'w-full'
        })
      ),
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `병음 폰트 크기: ${activityData.settings.pinyinFontSize}px`
        ),
        h('input', {
          type: 'range',
          min: 12, max: 36,
          value: activityData.settings.pinyinFontSize,
          onChange: (e) => updateSettings('pinyinFontSize', parseInt(e.target.value)),
          className: 'w-full'
        })
      ),
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `간격: ${activityData.settings.spacing}px`
        ),
        h('input', {
          type: 'range',
          min: 10, max: 50,
          value: activityData.settings.spacing,
          onChange: (e) => updateSettings('spacing', parseInt(e.target.value)),
          className: 'w-full'
        })
      )
    ),
    h('div', { className: 'border-t pt-4' },
      h('h4', { className: 'font-medium mb-3' }, '새 한자 추가'),
      h('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-3' },
        h('input', {
          type: 'text',
          placeholder: '한자',
          value: newCharacter.chinese,
          onChange: (e) => {
            const value = e.target.value;
            setNewCharacter(prev => ({ ...prev, chinese: value }));
            if (value && !newCharacter.pinyin) {
              const suggestion = getPinyinSuggestion(value);
              if (suggestion) {
                setNewCharacter(prev => ({ ...prev, pinyin: suggestion }));
              }
            }
          },
          className: 'px-3 py-2 border rounded chinese-character text-lg'
        }),
        h('input', {
          type: 'text',
          placeholder: '병음',
          value: newCharacter.pinyin,
          onChange: (e) => setNewCharacter(prev => ({ ...prev, pinyin: e.target.value })),
          className: 'px-3 py-2 border rounded pinyin-text'
        }),
        h('input', {
          type: 'text',
          placeholder: '뜻',
          value: newCharacter.meaning,
          onChange: (e) => setNewCharacter(prev => ({ ...prev, meaning: e.target.value })),
          className: 'px-3 py-2 border rounded'
        }),
        h('button', {
          onClick: addCharacter,
          className: 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition'
        }, '추가')
      )
    )
  );
}

// 활동 보드 컴포넌트
function ActivityBoard({ activityData, userAnswers, feedback, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const { characters, settings } = activityData;
  
  if (characters.length === 0) {
    return h('div', { className: 'text-center py-8' },
      h('p', { className: 'text-gray-500' }, '한자를 추가하여 액티비티를 시작하세요')
    );
  }
  
  return h('div', { className: 'space-y-8' },
    h('div', null,
      h('h3', { className: 'text-lg font-semibold mb-4 text-center' }, '중국어 한자'),
      h('div', {
        className: 'grid gap-4',
        style: { 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: `${settings.spacing}px`
        }
      }, ...characters.map(char =>
        h(ChineseCharacterCard, {
          key: `chinese-${char.id}`,
          character: char,
          fontSize: settings.chineseFontSize,
          userAnswer: userAnswers[char.id]?.chinese,
          feedback: feedback[char.id]?.chinese,
          onDragStart, onDragEnd, onDragOver, onDrop
        })
      ))
    ),
    h('div', null,
      h('h3', { className: 'text-lg font-semibold mb-4 text-center' }, '병음 (Pinyin)'),
      h('div', {
        className: 'grid gap-4',
        style: { 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: `${settings.spacing}px`
        }
      }, ...characters.map(char =>
        h(PinyinCard, {
          key: `pinyin-${char.id}`,
          character: char,
          fontSize: settings.pinyinFontSize,
          userAnswer: userAnswers[char.id]?.pinyin,
          feedback: feedback[char.id]?.pinyin,
          onDragStart, onDragEnd, onDragOver, onDrop
        })
      ))
    )
  );
}

// 중국어 한자 카드 컴포넌트
function ChineseCharacterCard({ character, fontSize, userAnswer, feedback, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const getFeedbackClass = () => {
    if (feedback === 'correct') return 'correct';
    if (feedback === 'incorrect') return 'incorrect';
    return '';
  };

  return h('div', { className: 'relative' },
    h('div', {
      className: `bg-white border-2 rounded-lg p-4 text-center chinese-character drop-zone ${getFeedbackClass()}`,
      onDragOver: onDragOver,
      onDrop: (e) => onDrop(e, character.id, 'chinese'),
      style: { minHeight: '120px' }
    },
      h('div', { 
        style: { fontSize: `${fontSize}px` },
        className: 'font-bold mb-2'
      }, character.chinese),
      h('div', { className: 'text-sm text-gray-600' }, character.meaning),
      userAnswer && h('div', { className: 'mt-2 p-2 bg-blue-100 rounded text-sm pinyin-text' },
        userAnswer.pinyin
      )
    )
  );
}

// 병음 카드 컴포넌트  
function PinyinCard({ character, fontSize, userAnswer, feedback, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const getFeedbackClass = () => {
    if (feedback === 'correct') return 'correct';
    if (feedback === 'incorrect') return 'incorrect';
    return '';
  };

  return h('div', { className: 'relative' },
    h('div', {
      className: `bg-white border-2 rounded-lg p-4 text-center drop-zone ${getFeedbackClass()}`,
      onDragOver: onDragOver,
      onDrop: (e) => onDrop(e, character.id, 'pinyin'),
      style: { minHeight: '120px' }
    },
      h('div', {
        className: `pinyin-text font-semibold mb-2 drag-item ${userAnswer ? 'opacity-50' : ''}`,
        style: { fontSize: `${fontSize}px` },
        draggable: !userAnswer,
        onDragStart: (e) => onDragStart(e, character, 'pinyin'),
        onDragEnd: onDragEnd
      }, character.pinyin),
      userAnswer && h('div', { className: 'mt-2 p-2 bg-green-100 rounded chinese-character text-lg' },
        userAnswer.chinese
      )
    )
  );
}

// 점수 표시 컴포넌트
function ScoreDisplay({ activityData, feedback }) {
  const totalQuestions = activityData.characters.length * 2;
  const correctAnswers = Object.values(feedback).reduce((count, charFeedback) => {
    if (charFeedback.chinese === 'correct') count++;
    if (charFeedback.pinyin === 'correct') count++;
    return count;
  }, 0);
  
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return h('div', { className: 'mt-6 p-4 bg-gray-50 rounded-lg' },
    h('div', { className: 'text-center' },
      h('div', { className: 'text-2xl font-bold text-gray-800 mb-2' },
        `점수: ${correctAnswers} / ${totalQuestions} (${percentage}%)`
      ),
      h('div', { className: 'w-full bg-gray-200 rounded-full h-4' },
        h('div', { 
          className: 'bg-blue-500 h-4 rounded-full transition-all duration-300',
          style: { width: `${percentage}%` }
        })
      )
    )
  );
}

// 메인 앱 렌더링
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, rendering Chinese Pinyin app...');
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(React.createElement(ChinesePinyinApp), root);
    console.log('Chinese Pinyin app rendered successfully!');
  } else {
    console.error('Root element not found!');
  }
});