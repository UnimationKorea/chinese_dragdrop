const { useState, useEffect, useCallback } = React;
const { createElement: h } = React;

// ========================================
// 중국어 성조 드래그 액티비티
// 완전히 독립적인 외부 액티비티
// ========================================

// 성조 데이터 및 유틸리티
const TONE_MARKS = {
  1: '¯',  // 1성 - 평성 (high level)
  2: '´',  // 2성 - 상성 (rising)
  3: 'ˇ',  // 3성 - 거성 (falling-rising)
  4: '`',  // 4성 - 거성 (falling)
  0: ''   // 경성 (neutral)
};

const TONE_NAMES = {
  1: '1성 (평성)',
  2: '2성 (상성)', 
  3: '3성 (거성)',
  4: '4성 (거성)',
  0: '경성'
};

const TONE_COLORS = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-green-500', 
  4: 'bg-blue-500',
  0: 'bg-gray-500'
};

// 활동 데이터
const toneActivities = [
  {
    id: "basic-greetings",
    title: "인사 표현", 
    description: "기본 인사말의 성조를 배치해보세요",
    sentence: {
      chinese: "你好吗？",
      pinyin: ["nǐ", "hǎo", "ma"],
      meaning: "안녕하세요?",
      characters: [
        { id: "char_1", char: "你", pinyin: "nǐ", tone: 3, position: 0 },
        { id: "char_2", char: "好", pinyin: "hǎo", tone: 3, position: 1 },
        { id: "char_3", char: "吗", pinyin: "ma", tone: 0, position: 2 }
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
    description: "중국어 숫자의 성조를 배치해보세요", 
    sentence: {
      chinese: "一二三四",
      pinyin: ["yī", "èr", "sān", "sì"],
      meaning: "일이삼사",
      characters: [
        { id: "char_4", char: "一", pinyin: "yī", tone: 1, position: 0 },
        { id: "char_5", char: "二", pinyin: "èr", tone: 4, position: 1 },
        { id: "char_6", char: "三", pinyin: "sān", tone: 1, position: 2 },
        { id: "char_7", char: "四", pinyin: "sì", tone: 4, position: 3 }
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
    description: "가족 관련 단어의 성조를 배치해보세요",
    sentence: {
      chinese: "爸爸妈妈",
      pinyin: ["bà", "ba", "mā", "ma"],
      meaning: "아버지 어머니",
      characters: [
        { id: "char_8", char: "爸", pinyin: "bà", tone: 4, position: 0 },
        { id: "char_9", char: "爸", pinyin: "ba", tone: 0, position: 1 },
        { id: "char_10", char: "妈", pinyin: "mā", tone: 1, position: 2 },
        { id: "char_11", char: "妈", pinyin: "ma", tone: 0, position: 3 }
      ]
    },
    settings: {
      fontSize: 50,
      pinyinFontSize: 25,
      spacing: 22,
      timeLimit: 150,
      showMeaning: true
    }
  }
];

// 메인 앱 컴포넌트
function ToneActivity() {
  const [currentView, setCurrentView] = useState('activity-selector'); // 'activity-selector' | 'activity' | 'results'
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activityData, setActivityData] = useState(null);

  const selectActivity = useCallback((activityId) => {
    const activity = toneActivities.find(a => a.id === activityId);
    if (activity) {
      setActivityData(activity);
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
      return h(ToneActivitySelector, { 
        activities: toneActivities,
        onSelectActivity: selectActivity
      });
    
    case 'activity': 
      return h(ToneGameActivity, {
        activityData,
        onBack: backToSelector,
        onComplete: showResults
      });
      
    case 'results':
      return h(ToneActivityResults, {
        onStartNew: backToSelector
      });
    
    default:
      return h('div', { className: 'text-center p-8' }, '알 수 없는 화면입니다.');
  }
}

// 활동 선택 컴포넌트
function ToneActivitySelector({ activities, onSelectActivity }) {
  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    h('div', { className: 'text-center mb-8' },
      h('h1', { 
        className: 'text-4xl font-bold text-gray-800 mb-4 chinese-character'
      }, '🎵 중국어 성조 학습'),
      h('p', { className: 'text-xl text-gray-600' },
        '중국어 글자 위에 올바른 성조를 드래그하여 배치하세요'
      ),
      h('div', { className: 'mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200' },
        h('div', { className: 'flex justify-center items-center gap-6 flex-wrap' },
          h('div', { className: 'flex items-center gap-2' },
            h('span', { className: 'w-4 h-4 bg-red-500 rounded' }),
            h('span', { className: 'text-sm font-medium' }, '1성 (¯)')
          ),
          h('div', { className: 'flex items-center gap-2' },
            h('span', { className: 'w-4 h-4 bg-orange-500 rounded' }),
            h('span', { className: 'text-sm font-medium' }, '2성 (´)')
          ),
          h('div', { className: 'flex items-center gap-2' },
            h('span', { className: 'w-4 h-4 bg-green-500 rounded' }),
            h('span', { className: 'text-sm font-medium' }, '3성 (ˇ)')
          ),
          h('div', { className: 'flex items-center gap-2' },
            h('span', { className: 'w-4 h-4 bg-blue-500 rounded' }),
            h('span', { className: 'text-sm font-medium' }, '4성 (`)')
          ),
          h('div', { className: 'flex items-center gap-2' },
            h('span', { className: 'w-4 h-4 bg-gray-500 rounded' }),
            h('span', { className: 'text-sm font-medium' }, '경성')
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
              className: 'w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200'
            }, '🎵 시작하기')
          )
        )
      )
    )
  );
}

// 메인 게임 액티비티
function ToneGameActivity({ activityData, onBack, onComplete }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [draggedTone, setDraggedTone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // 사용 가능한 성조 옵션 생성 (중복 포함)
  const availableTones = activityData.sentence.characters.map(char => char.tone);
  
  // 드래그 앤 드롭 핸들러
  const handleDragStart = useCallback((e, tone) => {
    setDraggedTone(tone);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTone(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, character) => {
    e.preventDefault();
    
    if (draggedTone === null) return;
    
    const isCorrect = character.tone === draggedTone;
    
    setUserAnswers(prev => ({
      ...prev,
      [character.id]: {
        tone: draggedTone,
        isCorrect
      }
    }));
    
    setFeedback(prev => ({
      ...prev,
      [character.id]: {
        type: isCorrect ? 'success' : 'error',
        message: isCorrect ? '정답!' : `틀렸습니다. 정답은 ${TONE_NAMES[character.tone]}입니다.`
      }
    }));

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
    
  }, [draggedTone, activityData, onComplete]);

  const resetActivity = useCallback(() => {
    setUserAnswers({});
    setFeedback({});
    setScore({ correct: 0, total: 0 });
    setStartTime(Date.now());
  }, []);

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
      h('div', { className: 'flex justify-center gap-6' },
        h('div', { className: 'text-center p-3 bg-blue-50 rounded-lg' },
          h('div', { className: 'text-2xl font-bold text-blue-600' },
            `${score.correct} / ${activityData.sentence.characters.length}`
          ),
          h('div', { className: 'text-sm text-gray-600' }, '정답')
        ),
        h('div', { className: 'text-center p-3 bg-green-50 rounded-lg' },
          h('div', { className: 'text-2xl font-bold text-green-600' },
            score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}%` : '0%'
          ),
          h('div', { className: 'text-sm text-gray-600' }, '정확도')
        )
      )
    ),

    // 설정 패널
    isEditing && h(ToneSettingsPanel, {
      activityData,
      setActivityData: () => {}, // 읽기 전용으로 설정
      onClose: () => setIsEditing(false)
    }),

    // 성조 옵션 패널
    h(ToneOptionsPanel, {
      availableTones,
      userAnswers,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd
    }),

    // 문장 표시 영역
    h(ToneSentenceDisplay, {
      activityData,
      userAnswers,
      feedback,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    })
  );
}

// 성조 옵션 패널
function ToneOptionsPanel({ availableTones, userAnswers, onDragStart, onDragEnd }) {
  const usedTones = Object.values(userAnswers).map(answer => answer.tone);
  
  return h('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
    h('h3', { className: 'text-xl font-bold mb-4 text-gray-800' },
      '🎵 아래 성조를 드래그하여 해당 글자 위에 올려주세요'
    ),
    h('div', { className: 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6' },
      h('div', { className: 'flex flex-wrap justify-center gap-4' },
        ...availableTones.map((tone, index) => {
          const isUsed = usedTones.includes(tone);
          return h('div', {
            key: `${tone}_${index}`,
            className: `relative px-6 py-4 rounded-xl cursor-grab font-bold transition-all duration-200 select-none text-white ${
              isUsed 
                ? 'opacity-50 cursor-not-allowed scale-95' 
                : `${TONE_COLORS[tone]} hover:scale-110 hover:shadow-lg active:scale-95`
            }`,
            draggable: !isUsed,
            onDragStart: (e) => !isUsed && onDragStart(e, tone),
            onDragEnd,
            style: { minWidth: '60px', textAlign: 'center' }
          }, 
            h('div', { className: 'text-2xl mb-1' }, TONE_MARKS[tone] || '○'),
            h('div', { className: 'text-xs' }, TONE_NAMES[tone]),
            isUsed && h('div', {
              className: 'absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs'
            }, '✓')
          );
        })
      )
    ),
    h('div', { className: 'mt-4 text-center' },
      h('p', { className: 'text-sm text-gray-500' },
        '💡 팁: 성조 마크를 글자 위 점선 박스에 드래그하면 자동으로 정답 여부를 확인할 수 있어요'
      )
    )
  );
}

// 문장 표시 컴포넌트
function ToneSentenceDisplay({ activityData, userAnswers, feedback, onDragOver, onDrop }) {
  return h('div', { className: 'bg-white rounded-lg shadow-lg p-8 mb-6' },
    h('div', { className: 'text-center mb-6' },
      h('div', { className: 'mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200' },
        h('p', { className: 'text-blue-800 text-lg font-medium' },
          `"${activityData.sentence.meaning}"`
        )
      )
    ),
    
    h('div', { className: 'text-center' },
      h('div', { className: 'inline-block py-8 px-6' },
        h('div', { className: 'flex items-end justify-center gap-3 flex-wrap' },
          ...activityData.sentence.characters.map(character => 
            h(ToneCharacterDropZone, {
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
function ToneCharacterDropZone({ character, userAnswer, feedback, settings, onDragOver, onDrop }) {
  const getFeedbackClass = () => {
    if (feedback) {
      if (feedback.type === 'success') return 'border-green-400 bg-green-50';
      if (feedback.type === 'error') return 'border-red-400 bg-red-50';
    }
    return 'border-purple-200 bg-purple-50';
  };

  const getToneClass = () => {
    if (feedback) {
      if (feedback.type === 'success') return 'bg-green-100 text-green-700 border-green-300';
      if (feedback.type === 'error') return 'bg-red-100 text-red-700 border-red-300';
    }
    return userAnswer ? `${TONE_COLORS[userAnswer.tone].replace('bg-', 'bg-opacity-20 bg-')} text-white border-purple-300` : 'bg-purple-100 text-purple-700 border-purple-300';
  };

  return h('div', { 
    className: 'relative flex flex-col items-center mb-4'
  },
    // 성조 드롭 영역
    h('div', {
      className: `min-w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center mb-2 transition-all duration-300 ${getFeedbackClass()} hover:scale-105 hover:border-solid hover:shadow-md cursor-pointer`,
      onDragOver: (e) => {
        onDragOver(e);
        e.currentTarget.classList.add('scale-110', 'border-purple-400', 'bg-purple-100');
      },
      onDragLeave: (e) => {
        e.currentTarget.classList.remove('scale-110', 'border-purple-400', 'bg-purple-100');
      },
      onDrop: (e) => {
        onDrop(e, character);
        e.currentTarget.classList.remove('scale-110', 'border-purple-400', 'bg-purple-100');
      },
      style: { 
        minHeight: `${Math.max(64, (settings?.pinyinFontSize || 24) + 24)}px`,
        minWidth: `${Math.max(64, (settings?.fontSize || 48) + 16)}px`
      }
    },
      userAnswer ? h('div', {
        className: `font-bold px-3 py-2 rounded-lg text-center shadow-sm transition-all duration-300 ${getToneClass()}`,
        style: { fontSize: `${(settings?.pinyinFontSize || 24) + 8}px` }
      }, 
        h('div', { className: 'text-2xl mb-1' }, TONE_MARKS[userAnswer.tone] || '○'),
        h('div', { className: 'text-xs' }, TONE_NAMES[userAnswer.tone])
      ) : h('div', {
        className: 'text-purple-400 text-xs font-medium opacity-60'
      }, '드래그')
    ),
    
    // 중국어 글자
    h('div', {
      className: 'chinese-character font-black text-gray-800 leading-tight select-none',
      style: { 
        fontSize: `${settings?.fontSize || 48}px`,
        lineHeight: '0.9'
      }
    }, character.char)
  );
}

// 설정 패널
function ToneSettingsPanel({ activityData, setActivityData, onClose }) {
  return h('div', { className: 'bg-gray-50 rounded-lg p-6 mb-6' },
    h('div', { className: 'flex justify-between items-center mb-4' },
      h('h3', { className: 'text-xl font-bold text-gray-800' }, '🛠️ 문장 액티비티 설정'),
      h('button', {
        onClick: onClose,
        className: 'px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition'
      }, '✕')
    ),
    
    h('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6' },
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `한자 폰트 크기: ${activityData.settings.fontSize}px`
        ),
        h('input', {
          type: 'range',
          min: 24, max: 72,
          value: activityData.settings.fontSize,
          className: 'w-full',
          readOnly: true
        })
      ),
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `성조 폰트 크기: ${activityData.settings.pinyinFontSize}px`
        ),
        h('input', {
          type: 'range',
          min: 12, max: 36,
          value: activityData.settings.pinyinFontSize,
          className: 'w-full',
          readOnly: true
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
          className: 'w-full',
          readOnly: true
        })
      ),
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          `제한시간: ${activityData.settings.timeLimit}초`
        ),
        h('input', {
          type: 'range',
          min: 0, max: 600,
          value: activityData.settings.timeLimit,
          className: 'w-full',
          readOnly: true
        })
      )
    ),
    
    h('div', { className: 'text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg' },
      h('p', { className: 'mb-1' }, '💡 현재 설정:'),
      h('ul', { className: 'list-disc list-inside space-y-1' },
        h('li', null, `글자 크기: ${activityData.settings.fontSize}px`),
        h('li', null, `성조 크기: ${activityData.settings.pinyinFontSize}px`),
        h('li', null, `제한시간: ${Math.floor(activityData.settings.timeLimit / 60)}분 ${activityData.settings.timeLimit % 60}초`)
      )
    )
  );
}

// 결과 화면 컴포넌트
function ToneActivityResults({ onStartNew }) {
  return h('div', { className: 'max-w-4xl mx-auto p-6' },
    h('div', { className: 'bg-white rounded-xl shadow-lg p-8 text-center' },
      h('div', { className: 'mb-6' },
        h('div', { className: 'text-6xl mb-4' }, '🎉'),
        h('h1', { className: 'text-3xl font-bold text-gray-800 mb-2' },
          '성조 학습 완료!'
        ),
        h('p', { className: 'text-xl text-gray-600' },
          '모든 성조를 올바르게 배치했습니다!'
        )
      ),
      
      h('button', {
        onClick: onStartNew,
        className: 'px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl'
      }, '🎵 새로운 활동 시작하기')
    )
  );
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(h(ToneActivity), document.getElementById('root'));
});