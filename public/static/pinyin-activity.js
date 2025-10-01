const { useState, useEffect, useCallback } = React;
const { createElement: h } = React;

// ========================================
// 중국어 병음 드래그 액티비티
// 완전히 독립적인 외부 액티비티
// ========================================

// 병음 추천 함수
function getPinyinSuggestion(chinese) {
  const chinesePinyinMap = {
    "你": "nǐ", "好": "hǎo", "吗": "ma",
    "一": "yī", "二": "èr", "三": "sān", "四": "sì", 
    "爸": "bà", "妈": "mā", "我": "wǒ", "叫": "jiào",
    "李": "lǐ", "明": "míng", "现": "xiàn", "在": "zài",
    "几": "jǐ", "点": "diǎn", "要": "yào", "碗": "wǎn",
    "面": "miàn", "条": "tiáo"
  };
  return chinesePinyinMap[chinese] || '';
}

// 활동 데이터
const pinyinActivities = [
  {
    id: "basic-greetings",
    title: "인사 표현", 
    description: "기본 인사말의 병음을 배치해보세요",
    sentence: {
      chinese: "你好吗？",
      pinyin: ["nǐ", "hǎo", "ma"],
      meaning: "안녕하세요?",
      characters: [
        { id: "char_1", char: "你", pinyin: "nǐ", position: 0 },
        { id: "char_2", char: "好", pinyin: "hǎo", position: 1 },
        { id: "char_3", char: "吗", pinyin: "ma", position: 2 }
      ]
    },
    settings: {
      fontSize: 52,
      pinyinFontSize: 26,
      spacing: 25,
      timeLimit: 180,
      showMeaning: true
    }
  },
  {
    id: "numbers",
    title: "숫자 표현",
    description: "중국어 숫자의 병음을 배치해보세요", 
    sentence: {
      chinese: "一二三四",
      pinyin: ["yī", "èr", "sān", "sì"],
      meaning: "일이삼사",
      characters: [
        { id: "char_4", char: "一", pinyin: "yī", position: 0 },
        { id: "char_5", char: "二", pinyin: "èr", position: 1 },
        { id: "char_6", char: "三", pinyin: "sān", position: 2 },
        { id: "char_7", char: "四", pinyin: "sì", position: 3 }
      ]
    },
    settings: {
      fontSize: 48,
      pinyinFontSize: 24, 
      spacing: 20,
      timeLimit: 120,
      showMeaning: true
    }
  },
  {
    id: "family",
    title: "가족 호칭",
    description: "가족 관련 단어의 병음을 배치해보세요",
    sentence: {
      chinese: "爸爸妈妈",
      pinyin: ["bà", "ba", "mā", "ma"],
      meaning: "아버지 어머니",
      characters: [
        { id: "char_8", char: "爸", pinyin: "bà", position: 0 },
        { id: "char_9", char: "爸", pinyin: "ba", position: 1 },
        { id: "char_10", char: "妈", pinyin: "mā", position: 2 },
        { id: "char_11", char: "妈", pinyin: "ma", position: 3 }
      ]
    },
    settings: {
      fontSize: 50,
      pinyinFontSize: 25,
      spacing: 22,
      timeLimit: 150,
      showMeaning: true
    }
  },
  {
    id: "self-introduction",
    title: "자기 소개",
    description: "자기 소개 표현의 병음을 배치해보세요",
    sentence: {
      chinese: "我叫李明",
      pinyin: ["wǒ", "jiào", "lǐ", "míng"],
      meaning: "저는 이명이라고 합니다",
      characters: [
        { id: "char_12", char: "我", pinyin: "wǒ", position: 0 },
        { id: "char_13", char: "叫", pinyin: "jiào", position: 1 },
        { id: "char_14", char: "李", pinyin: "lǐ", position: 2 },
        { id: "char_15", char: "明", pinyin: "míng", position: 3 }
      ]
    },
    settings: {
      fontSize: 48,
      pinyinFontSize: 24,
      spacing: 20,
      timeLimit: 200,
      showMeaning: true
    }
  }
];

// 메인 앱 컴포넌트
function PinyinActivity() {
  const [currentView, setCurrentView] = useState('activity-selector'); // 'activity-selector' | 'activity' | 'results'
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activityData, setActivityData] = useState(null);

  const selectActivity = useCallback((activityId) => {
    let activity = pinyinActivities.find(a => a.id === activityId);
    
    if (activityId === 'custom') {
      activity = {
        id: 'custom',
        title: '새 활동',
        description: '새로운 병음 학습 활동',
        sentence: {
          chinese: '',
          pinyin: [],
          meaning: '',
          characters: []
        },
        settings: {
          fontSize: 52,
          pinyinFontSize: 26,
          spacing: 25,
          timeLimit: 180,
          showMeaning: true
        }
      };
    }
    
    if (activity) {
      setActivityData({ ...activity }); // 깊은 복사로 수정 가능하게
      setSelectedActivityId(activityId);
      setCurrentView('activity');
    }
  }, []);

  const backToSelector = useCallback(() => {
    setCurrentView('activity-selector');
    setSelectedActivityId(null);
    setActivityData(null);
  }, []);

  const showResults = useCallback((results) => {
    setCurrentView('results');
  }, []);

  switch (currentView) {
    case 'activity-selector':
      return h(PinyinActivitySelector, { 
        activities: pinyinActivities,
        onSelectActivity: selectActivity
      });
    
    case 'activity': 
      return h(PinyinGameActivity, {
        activityData,
        setActivityData,
        onBack: backToSelector,
        onComplete: showResults
      });
      
    case 'results':
      return h(PinyinActivityResults, {
        onStartNew: backToSelector
      });
    
    default:
      return h('div', { className: 'text-center p-8' }, '알 수 없는 화면입니다.');
  }
}

// 활동 선택 컴포넌트
function PinyinActivitySelector({ activities, onSelectActivity }) {
  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    h('div', { className: 'text-center mb-8' },
      h('h1', { 
        className: 'text-4xl font-bold text-gray-800 mb-4 chinese-character'
      }, '🔤 중국어 병음 학습'),
      h('p', { className: 'text-xl text-gray-600' },
        '중국어 글자 위에 올바른 병음을 드래그하여 배치하세요'
      ),
      h('div', { className: 'mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200' },
        h('div', { className: 'text-center' },
          h('p', { className: 'text-sm font-medium text-blue-800' },
            '💡 병음을 해당 글자 위 점선 박스에 드래그하면 자동으로 정답 여부를 확인할 수 있어요'
          )
        )
      )
    ),
    
    h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      ...activities.map(activity =>
        h('div', {
          key: activity.id,
          className: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100',
          onClick: () => onSelectActivity(activity.id)
        },
          h('div', { className: 'p-6' },
            h('div', { className: 'text-center mb-4' },
              h('div', { className: 'chinese-character text-4xl font-bold text-gray-800 mb-2' },
                activity.sentence.chinese
              ),
              h('div', { className: 'text-lg text-blue-600 mb-2' },
                `"${activity.sentence.meaning}"`
              )
            ),
            h('h3', { className: 'text-xl font-bold mb-2 text-gray-800' },
              activity.title
            ),
            h('p', { className: 'text-gray-600 mb-4' },
              activity.description
            ),
            h('div', { className: 'flex justify-between text-sm text-gray-500 mb-4' },
              h('span', null, `${activity.sentence.characters.length}개 글자`),
              h('span', null, `${Math.floor(activity.settings.timeLimit / 60)}분`)
            ),
            h('button', {
              className: 'w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200'
            }, '🔤 시작하기')
          )
        )
      )
    ),
    h('div', { className: 'mt-8 text-center' },
      h('button', {
        onClick: () => onSelectActivity('custom'),
        className: 'px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
      }, '+ 새 액티비티 만들기')
    )
  );
}

// 메인 게임 액티비티
function PinyinGameActivity({ activityData, setActivityData, onBack, onComplete }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [draggedPinyin, setDraggedPinyin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [availablePinyin, setAvailablePinyin] = useState([]);

  // 컴포넌트 마운트 시 병음 옵션 초기화
  useEffect(() => {
    if (activityData.sentence.pinyin && activityData.sentence.pinyin.length > 0) {
      const shuffledPinyin = [...activityData.sentence.pinyin].sort(() => Math.random() - 0.5);
      setAvailablePinyin(shuffledPinyin.map((pinyin, index) => ({ 
        id: index, 
        pinyin, 
        used: false 
      })));
    }
  }, [activityData]);
  
  // 드래그 앤 드롭 핸들러
  const handleDragStart = useCallback((e, pinyinItem) => {
    if (pinyinItem.used) return;
    setDraggedPinyin(pinyinItem);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPinyin(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, character) => {
    e.preventDefault();
    
    if (!draggedPinyin || draggedPinyin.used) return;
    
    const isCorrect = character.pinyin === draggedPinyin.pinyin;
    
    // 기존에 배치된 병음이 있다면 되돌리기
    if (userAnswers[character.id]) {
      const prevPinyinId = userAnswers[character.id].pinyinId;
      setAvailablePinyin(prev => prev.map(item => 
        item.id === prevPinyinId ? { ...item, used: false } : item
      ));
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [character.id]: {
        pinyin: draggedPinyin.pinyin,
        pinyinId: draggedPinyin.id,
        isCorrect
      }
    }));
    
    setFeedback(prev => ({
      ...prev,
      [character.id]: {
        type: isCorrect ? 'success' : 'error',
        message: isCorrect ? '정답!' : `틀렸습니다. 정답은 "${character.pinyin}"입니다.`
      }
    }));

    // 병음을 사용됨으로 표시
    setAvailablePinyin(prev => prev.map(item => 
      item.id === draggedPinyin.id ? { ...item, used: true } : item
    ));

    // 점수 업데이트
    setScore(prev => {
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      const newTotal = prev.total + 1;
      
      // 모든 문제 완료 시
      if (newTotal === activityData.sentence.characters.length) {
        setTimeout(() => onComplete({ correct: newCorrect, total: newTotal }), 1500);
      }
      
      return { correct: newCorrect, total: newTotal };
    });
    
  }, [draggedPinyin, activityData, onComplete, userAnswers]);

  const resetActivity = useCallback(() => {
    setUserAnswers({});
    setFeedback({});
    setScore({ correct: 0, total: 0 });
    setStartTime(Date.now());
    
    // 병음 옵션 리셋
    if (activityData.sentence.pinyin && activityData.sentence.pinyin.length > 0) {
      const shuffledPinyin = [...activityData.sentence.pinyin].sort(() => Math.random() - 0.5);
      setAvailablePinyin(shuffledPinyin.map((pinyin, index) => ({ 
        id: index, 
        pinyin, 
        used: false 
      })));
    }
  }, [activityData]);

  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    // 헤더
    h('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
      h('div', { className: 'flex justify-between items-center mb-4' },
        h('div', { className: 'flex items-center gap-4' },
          h('button', {
            onClick: onBack,
            className: 'px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
          }, '← 뒤로'),
          h('div', null,
            h('h1', { className: 'text-2xl font-bold text-gray-800' },
              activityData.title
            ),
            h('p', { className: 'text-gray-600' },
              activityData.description
            )
          )
        ),
        h('div', { className: 'flex gap-2' },
          h('button', {
            onClick: () => setIsEditing(!isEditing),
            className: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
          }, isEditing ? '편집 완료' : '설정 편집'),
          h('button', {
            onClick: resetActivity,
            className: 'px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
          }, '다시 시작')
        )
      ),
      
      // 점수 표시
      activityData.sentence.characters.length > 0 && h('div', { className: 'flex justify-center gap-6' },
        h('div', { className: 'text-center p-3 bg-blue-50 rounded-lg' },
          h('div', { className: 'text-2xl font-bold text-blue-600' },
            `${score.correct} / ${activityData.sentence.characters.length}`
          ),
          h('div', { className: 'text-sm text-gray-600' }, '정답')
        ),
        h('div', { className: 'text-center p-3 bg-green-50 rounded-lg' },
          h('div', { className: 'text-2xl font-bold text-green-600' },
            activityData.sentence.characters.length > 0 ? `${Math.round((score.correct / activityData.sentence.characters.length) * 100)}%` : '0%'
          ),
          h('div', { className: 'text-sm text-gray-600' }, '정확도')
        )
      )
    ),

    // 설정 패널
    isEditing && h(PinyinSettingsPanel, {
      activityData,
      setActivityData,
      onClose: () => setIsEditing(false),
      onReset: resetActivity
    }),

    // 병음 옵션 패널
    activityData.sentence.characters.length > 0 && h(PinyinOptionsPanel, {
      availablePinyin,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd
    }),

    // 문장 표시 영역
    h(PinyinSentenceDisplay, {
      activityData,
      userAnswers,
      feedback,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    })
  );
}

// 병음 옵션 패널
function PinyinOptionsPanel({ availablePinyin, onDragStart, onDragEnd }) {
  return h('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
    h('h3', { className: 'text-xl font-bold mb-6 text-center text-gray-700' },
      '🎯 아래 병음을 드래그하여 해당 글자 위에 올려주세요'
    ),
    h('div', { className: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm' },
      h('div', { className: 'flex flex-wrap justify-center gap-4' },
        ...availablePinyin.map(pinyinItem =>
          h('div', {
            key: pinyinItem.id,
            className: `relative px-5 py-3 rounded-xl cursor-grab pinyin-text font-bold transition-all duration-200 select-none ${
              pinyinItem.used 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 scale-95' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 hover:shadow-md active:scale-95'
            }`,
            draggable: !pinyinItem.used,
            onDragStart: (e) => onDragStart(e, pinyinItem),
            onDragEnd,
            style: { 
              fontSize: '18px',
              minWidth: '50px',
              textAlign: 'center'
            }
          }, 
            pinyinItem.pinyin,
            pinyinItem.used && h('div', {
              className: 'absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs'
            }, '✓')
          )
        )
      )
    ),
    h('div', { className: 'mt-4 text-center' },
      h('p', { className: 'text-sm text-gray-500' },
        '💡 팁: 병음을 글자 위 점선 박스에 드래그하면 자동으로 정답 여부를 확인할 수 있어요'
      )
    )
  );
}

// 문장 표시 컴포넌트
function PinyinSentenceDisplay({ activityData, userAnswers, feedback, onDragOver, onDrop }) {
  if (!activityData.sentence.characters || activityData.sentence.characters.length === 0) {
    return h('div', { className: 'bg-white rounded-lg shadow-lg p-8 mb-6 text-center' },
      h('p', { className: 'text-gray-500' }, '문장을 설정해주세요')
    );
  }

  return h('div', { className: 'bg-white rounded-lg shadow-lg p-8 mb-6' },
    // 문장 의미
    activityData.settings.showMeaning && activityData.sentence.meaning && h('div', { className: 'text-center mb-8' },
      h('div', { className: 'p-4 bg-blue-50 rounded-lg border border-blue-200' },
        h('p', { className: 'text-blue-800 text-lg font-medium' },
          `"${activityData.sentence.meaning}"`
        )
      )
    ),
    
    h('div', { className: 'text-center' },
      h('div', { className: 'inline-block py-12 px-8 bg-white rounded-2xl shadow-lg border-2 border-gray-100' },
        h('div', { className: 'flex items-end justify-center gap-1 flex-wrap' },
          ...activityData.sentence.characters.map(character => 
            h(PinyinCharacterDropZone, {
              key: character.id,
              character,
              userAnswer: userAnswers[character.id],
              feedback: feedback[character.id],
              settings: activityData.settings,
              onDragOver,
              onDrop
            })
          )
        )
      )
    )
  );
}

// 개별 글자 드롭 존
function PinyinCharacterDropZone({ character, userAnswer, feedback, settings, onDragOver, onDrop }) {
  const getFeedbackClass = () => {
    if (feedback) {
      if (feedback.type === 'success') return 'border-green-400 bg-green-50';
      if (feedback.type === 'error') return 'border-red-400 bg-red-50';
    }
    return 'border-blue-200 bg-blue-25';
  };

  const getPinyinBackgroundClass = () => {
    if (feedback) {
      if (feedback.type === 'success') return 'bg-green-100 text-green-700 border-green-300';
      if (feedback.type === 'error') return 'bg-red-100 text-red-700 border-red-300';
    }
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return h('div', { 
    className: 'relative flex flex-col items-center',
    style: { marginBottom: '8px', marginRight: '4px' }
  },
    // 병음 드롭 영역
    h('div', {
      className: `min-w-16 h-10 border-2 border-dashed rounded-md flex items-center justify-center mb-1 transition-all duration-200 hover:scale-105 hover:border-solid hover:shadow-md ${getFeedbackClass()}`,
      onDragOver: (e) => {
        onDragOver(e);
        e.currentTarget.classList.add('scale-110', 'border-blue-400', 'bg-blue-50');
      },
      onDragLeave: (e) => {
        e.currentTarget.classList.remove('scale-110', 'border-blue-400', 'bg-blue-50');
      },
      onDrop: (e) => {
        onDrop(e, character);
        e.currentTarget.classList.remove('scale-110', 'border-blue-400', 'bg-blue-50');
      },
      style: { 
        minHeight: `${Math.max(40, settings?.pinyinFontSize + 16)}px`,
        minWidth: `${Math.max(64, settings?.fontSize + 16)}px`
      }
    },
      userAnswer ? h('div', {
        className: `pinyin-text font-bold px-2 py-1 rounded-md text-center shadow-sm transform transition-all duration-300 animate-pulse ${getPinyinBackgroundClass()}`,
        style: { 
          fontSize: `${settings?.pinyinFontSize}px`,
          animation: 'fadeIn 0.3s ease-in'
        }
      }, userAnswer.pinyin) : h('div', {
        className: 'text-gray-400 text-xs font-medium opacity-60',
        style: { fontSize: '11px' }
      }, '드래그')
    ),
    
    // 중국어 글자
    h('div', {
      className: 'chinese-character font-black text-gray-800 leading-none select-none',
      style: { 
        fontSize: `${settings?.fontSize}px`,
        lineHeight: '0.9',
        marginTop: '-2px'
      }
    }, character.char)
  );
}

// 설정 패널 - 완전히 동작하는 설정 편집 기능
function PinyinSettingsPanel({ activityData, setActivityData, onClose, onReset }) {
  const [newSentence, setNewSentence] = useState({
    chinese: '',
    pinyin: '',
    meaning: ''
  });

  const updateSettings = (key, value) => {
    setActivityData(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  const applyTemplate = (templateName) => {
    const templates = {
      basic: {
        fontSize: 52,
        pinyinFontSize: 26,
        spacing: 25,
        showMeaning: true,
        timeLimit: 180
      },
      compact: {
        fontSize: 36,
        pinyinFontSize: 18,
        spacing: 15,
        showMeaning: false,
        timeLimit: 120
      },
      large: {
        fontSize: 60,
        pinyinFontSize: 30,
        spacing: 30,
        showMeaning: true,
        timeLimit: 0
      }
    };

    if (templates[templateName]) {
      setActivityData(prev => ({
        ...prev,
        settings: { ...prev.settings, ...templates[templateName] }
      }));
    }
  };

  const parseChineseText = (chinese, pinyinString) => {
    if (!chinese || !pinyinString) return [];
    
    const characters = chinese.split('').filter(char => char !== '？' && char !== '。' && char !== '！');
    const pinyinArray = pinyinString.split(' ').filter(p => p.trim() !== '');
    
    return characters.map((char, index) => ({
      id: `char_${index + 1}`,
      char: char,
      pinyin: pinyinArray[index] || '',
      position: index
    }));
  };

  const addSentence = () => {
    if (newSentence.chinese && newSentence.pinyin && newSentence.meaning) {
      const characters = parseChineseText(newSentence.chinese, newSentence.pinyin);
      const pinyinArray = newSentence.pinyin.split(' ').filter(p => p.trim() !== '');
      
      setActivityData(prev => ({
        ...prev,
        sentence: {
          chinese: newSentence.chinese,
          pinyin: pinyinArray,
          meaning: newSentence.meaning,
          characters: characters
        }
      }));
      setNewSentence({ chinese: '', pinyin: '', meaning: '' });
      
      // 새 문장 추가 후 액티비티 리셋
      setTimeout(() => onReset(), 100);
    }
  };

  return h('div', { className: 'bg-gray-50 rounded-lg p-6 mb-8' },
    h('div', { className: 'flex justify-between items-center mb-6' },
      h('h3', { className: 'text-xl font-bold text-gray-800' }, '🛠️ 문장 액티비티 설정'),
      h('button', {
        onClick: onClose,
        className: 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition'
      }, '편집 완료')
    ),
    
    // 폰트 및 레이아웃 설정 (실제 동작)
    h('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-8' },
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `한자 폰트 크기: ${activityData.settings.fontSize}px`
        ),
        h('input', {
          type: 'range',
          min: 24, max: 72,
          value: activityData.settings.fontSize,
          onChange: (e) => updateSettings('fontSize', parseInt(e.target.value)),
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
      ),
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `제한시간: ${activityData.settings.timeLimit}초`
        ),
        h('input', {
          type: 'range',
          min: 0, max: 600, step: 30,
          value: activityData.settings.timeLimit,
          onChange: (e) => updateSettings('timeLimit', parseInt(e.target.value)),
          className: 'w-full'
        })
      )
    ),

    // 액티비티 옵션 및 빠른 템플릿
    h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8 mb-8' },
      h('div', { className: 'space-y-4' },
        h('h4', { className: 'font-bold text-gray-800' }, '액티비티 옵션'),
        h('label', { className: 'flex items-center' },
          h('input', {
            type: 'checkbox',
            checked: activityData.settings.showMeaning,
            onChange: (e) => updateSettings('showMeaning', e.target.checked),
            className: 'mr-3'
          }),
          '한국어 뜻 표시'
        )
      ),
      h('div', null,
        h('h4', { className: 'font-bold text-gray-800 mb-3' }, '빠른 템플릿 적용'),
        h('div', { className: 'space-y-2' },
          h('button', {
            onClick: () => applyTemplate('basic'),
            className: 'w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition'
          }, '기본 설정'),
          h('button', {
            onClick: () => applyTemplate('compact'),
            className: 'w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition'
          }, '컴팩트 설정'),
          h('button', {
            onClick: () => applyTemplate('large'),
            className: 'w-full px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition'
          }, '대형 설정')
        )
      )
    ),

    // 새 문장 추가 기능
    h('div', { className: 'border-t border-gray-200 pt-6' },
      h('h4', { className: 'font-bold text-gray-800 mb-4' }, '📝 새 문장 추가'),
      h('div', { className: 'grid grid-cols-1 gap-4' },
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, '중국어 문장'),
          h('input', {
            type: 'text',
            placeholder: '예: 你好吗？',
            value: newSentence.chinese,
            onChange: (e) => setNewSentence(prev => ({ ...prev, chinese: e.target.value })),
            className: 'w-full px-4 py-3 border rounded-lg chinese-character text-lg'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, '병음 (공백으로 구분)'),
          h('input', {
            type: 'text',
            placeholder: '예: nǐ hǎo ma',
            value: newSentence.pinyin,
            onChange: (e) => setNewSentence(prev => ({ ...prev, pinyin: e.target.value })),
            className: 'w-full px-4 py-3 border rounded-lg pinyin-text'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, '한국어 뜻'),
          h('input', {
            type: 'text',
            placeholder: '예: 안녕하세요?',
            value: newSentence.meaning,
            onChange: (e) => setNewSentence(prev => ({ ...prev, meaning: e.target.value })),
            className: 'w-full px-4 py-3 border rounded-lg'
          })
        ),
        h('button', {
          onClick: addSentence,
          className: 'px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold'
        }, '✅ 문장 추가')
      ),
      h('div', { className: 'mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg' },
        h('p', { className: 'mb-1' }, '💡 사용법:'),
        h('ul', { className: 'list-disc list-inside space-y-1' },
          h('li', null, '중국어는 물음표(？)나 마침표(。) 포함 가능'),
          h('li', null, '병음은 각 글자에 대응되도록 공백으로 구분'),
          h('li', null, '예: "你好吗？" → "nǐ hǎo ma" (3글자)')
        )
      )
    ),

    // 현재 문장 정보
    activityData.sentence && activityData.sentence.chinese && h('div', { className: 'border-t border-gray-200 pt-6 mt-6' },
      h('h4', { className: 'font-bold text-gray-800 mb-4' }, '📋 현재 문장'),
      h('div', { className: 'bg-white p-4 rounded-lg border' },
        h('div', { className: 'chinese-character text-2xl mb-2' }, activityData.sentence.chinese),
        h('div', { className: 'pinyin-text text-lg text-blue-600 mb-2' }, 
          activityData.sentence.pinyin.join(' ')
        ),
        h('div', { className: 'text-gray-700' }, `"${activityData.sentence.meaning}"`),
        h('div', { className: 'text-sm text-gray-500 mt-2' }, 
          `총 ${activityData.sentence.characters.length}개 글자`
        )
      )
    )
  );
}

// 결과 화면 컴포넌트
function PinyinActivityResults({ onStartNew }) {
  return h('div', { className: 'max-w-4xl mx-auto p-6' },
    h('div', { className: 'bg-white rounded-xl shadow-lg p-8 text-center' },
      h('div', { className: 'mb-6' },
        h('div', { className: 'text-6xl mb-4' }, '🎉'),
        h('h1', { className: 'text-3xl font-bold text-gray-800 mb-2' },
          '병음 학습 완료!'
        ),
        h('p', { className: 'text-xl text-gray-600' },
          '모든 병음을 올바르게 배치했습니다!'
        )
      ),
      
      h('button', {
        onClick: onStartNew,
        className: 'px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl'
      }, '🔤 새로운 활동 시작하기')
    )
  );
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(h(PinyinActivity), document.getElementById('root'));
});