const { useState, useEffect, useCallback, useRef } = React;
const { createElement: h } = React;

// ========================================
// V2 ENHANCED CHARACTER-PINYIN ACTIVITY
// Complete Template Implementation
// ========================================

// Utility Functions
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const calculateScore = (correct, total, timeBonus = 0) => {
  const baseScore = (correct / total) * 100;
  return Math.round(baseScore + timeBonus);
};

// API Service Layer
class ActivityAPI {
  static baseURL = '/api/v2/character-pinyin';

  static async getActivities() {
    try {
      const response = await fetch(`${this.baseURL}/activities`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }

  static async getActivity(id, shuffle = true) {
    try {
      const response = await fetch(`${this.baseURL}/activities/${id}?shuffle=${shuffle}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      return null;
    }
  }

  static async startSession(activityId, userId = 'anonymous') {
    try {
      const response = await fetch(`${this.baseURL}/activities/${activityId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }

  static async submitAnswer(sessionId, characterId, submittedPinyin, timeSpent) {
    try {
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, submittedPinyin, timeSpent })
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return null;
    }
  }

  static async getProgress(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}/progress`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  }

  static async getStats(activityId) {
    try {
      const response = await fetch(`${this.baseURL}/activities/${activityId}/stats`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }
}

// Main Application Component
function V2EnhancedApp() {
  const [currentView, setCurrentView] = useState('activity-selector'); // 'activity-selector' | 'activity' | 'results'
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectActivity = useCallback((activityId) => {
    setSelectedActivityId(activityId);
    setCurrentView('activity');
    setError(null);
  }, []);

  const startNewActivity = useCallback(() => {
    setCurrentView('activity-selector');
    setSelectedActivityId(null);
    setSessionData(null);
    setError(null);
  }, []);

  const showResults = useCallback((results) => {
    setSessionData(results);
    setCurrentView('results');
  }, []);

  if (loading) {
    return h(LoadingSpinner, { message: '활동을 준비하는 중...' });
  }

  if (error) {
    return h(ErrorDisplay, { 
      error, 
      onRetry: () => {
        setError(null);
        setCurrentView('activity-selector');
      }
    });
  }

  switch (currentView) {
    case 'activity-selector':
      return h(ActivitySelector, { 
        onSelectActivity: selectActivity,
        onError: setError 
      });
    
    case 'activity':
      return h(EnhancedCharacterPinyinActivity, {
        activityId: selectedActivityId,
        onBack: startNewActivity,
        onComplete: showResults,
        onError: setError
      });
    
    case 'results':
      return h(ActivityResults, {
        sessionData,
        onStartNew: startNewActivity
      });
    
    default:
      return h('div', { className: 'text-center p-8' }, '알 수 없는 화면입니다.');
  }
}

// Activity Selector Component
function ActivitySelector({ onSelectActivity, onError }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await ActivityAPI.getActivities();
        setActivities(data);
      } catch (error) {
        onError('활동 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [onError]);

  if (loading) {
    return h(LoadingSpinner, { message: '활동 목록을 불러오는 중...' });
  }

  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    h('div', { className: 'text-center mb-8' },
      h('h1', { 
        className: 'text-4xl font-bold text-gray-800 mb-4',
        'aria-level': '1'
      }, '🎯 V2 Enhanced Character-Pinyin Activity'),
      h('p', { className: 'text-xl text-gray-600' },
        '문장 속 각 글자에 올바른 병음을 배치하여 중국어를 학습하세요'
      )
    ),
    
    h('div', { 
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      role: 'list',
      'aria-label': '사용 가능한 활동 목록'
    },
      ...activities.map(activity =>
        h(ActivityCard, {
          key: activity.id,
          activity,
          onSelect: onSelectActivity
        })
      )
    )
  );
}

// Activity Card Component
function ActivityCard({ activity, onSelect }) {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty] || colors.beginner;
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    };
    return labels[difficulty] || '초급';
  };

  return h('div', {
    className: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100',
    onClick: () => onSelect(activity.id),
    role: 'listitem',
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(activity.id);
      }
    },
    'aria-label': `${activity.chinese} 활동 시작하기`
  },
    h('div', { className: 'p-6' },
      // Header
      h('div', { className: 'flex justify-between items-start mb-4' },
        h('div', { className: 'chinese-character text-3xl font-bold text-gray-800' },
          activity.chinese
        ),
        h('div', { 
          className: `px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(activity.difficulty)}`
        }, getDifficultyLabel(activity.difficulty))
      ),
      
      // Meaning
      h('div', { className: 'mb-4' },
        h('p', { className: 'text-lg text-gray-700 font-medium' },
          `"${activity.meaning}"`
        )
      ),
      
      // Tags
      h('div', { className: 'flex flex-wrap gap-2 mb-4' },
        ...activity.tags.map(tag =>
          h('span', {
            key: tag,
            className: 'px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded'
          }, `#${tag}`)
        )
      ),
      
      // Stats
      h('div', { className: 'flex justify-between text-sm text-gray-500 mb-4' },
        h('span', null, `${activity.characterCount}개 글자`),
        h('span', null, '🎯 드래그 & 드롭')
      ),
      
      // Start Button
      h('button', {
        className: 'w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 focus:ring-2 focus:ring-blue-300',
        onClick: (e) => {
          e.stopPropagation();
          onSelect(activity.id);
        }
      }, '🚀 시작하기')
    )
  );
}

// Main Enhanced Character-Pinyin Activity Component
function EnhancedCharacterPinyinActivity({ activityId, onBack, onComplete, onError }) {
  const [sessionData, setSessionData] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [progress, setProgress] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [draggedPinyin, setDraggedPinyin] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize activity session
  useEffect(() => {
    const initializeActivity = async () => {
      try {
        setLoading(true);
        const sessionResult = await ActivityAPI.startSession(activityId);
        
        if (!sessionResult) {
          throw new Error('활동을 시작할 수 없습니다.');
        }

        setSessionData(sessionResult);
        setCurrentActivity(sessionResult.activity);
        setProgress(sessionResult.progress);
        setStartTime(Date.now());
      } catch (error) {
        onError('활동을 시작하는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      initializeActivity();
    }
  }, [activityId, onError]);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e, pinyinData) => {
    setDraggedPinyin(pinyinData);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pinyinData.pinyin);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPinyin(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e, character) => {
    e.preventDefault();
    
    if (!draggedPinyin || submitting) return;
    
    try {
      setSubmitting(true);
      
      const timeSpent = startTime ? Date.now() - startTime : 0;
      const result = await ActivityAPI.submitAnswer(
        sessionData.sessionId,
        character.id,
        draggedPinyin.pinyin,
        timeSpent
      );

      if (result) {
        // Update local state
        setUserAnswers(prev => ({
          ...prev,
          [character.id]: {
            pinyin: draggedPinyin.pinyin,
            isCorrect: result.isCorrect
          }
        }));

        setFeedback(prev => ({
          ...prev,
          [character.id]: result.feedback
        }));

        setProgress(result.progress);

        // Check if activity is completed
        if (result.progress.status === 'completed') {
          setTimeout(() => {
            onComplete({
              sessionId: sessionData.sessionId,
              progress: result.progress,
              activity: currentActivity
            });
          }, 1500);
        }
      }
    } catch (error) {
      onError('답안을 제출하는데 실패했습니다.');
    } finally {
      setSubmitting(false);
      setDraggedPinyin(null);
    }
  }, [draggedPinyin, submitting, sessionData, startTime, onComplete, onError, currentActivity]);

  if (loading) {
    return h(LoadingSpinner, { message: '활동을 준비하는 중...' });
  }

  if (!currentActivity) {
    return h(ErrorDisplay, { 
      error: '활동을 찾을 수 없습니다.',
      onRetry: onBack
    });
  }

  return h('div', { className: 'max-w-6xl mx-auto p-6' },
    // Header
    h(ActivityHeader, {
      activity: currentActivity,
      progress,
      onBack,
      submitting
    }),

    // Pinyin Options
    h(PinyinOptionsPanel, {
      pinyinOptions: currentActivity.pinyinOptions || [],
      userAnswers,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd
    }),

    // Main Activity Area
    h(CharacterSentenceDisplay, {
      activity: currentActivity,
      userAnswers,
      feedback,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      submitting
    }),

    // Progress Display
    h(ProgressDisplay, {
      progress,
      activity: currentActivity
    })
  );
}

// Activity Header Component
function ActivityHeader({ activity, progress, onBack, submitting }) {
  return h('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
    h('div', { className: 'flex justify-between items-center' },
      h('div', { className: 'flex items-center gap-4' },
        h('button', {
          onClick: onBack,
          className: 'px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50',
          disabled: submitting,
          'aria-label': '활동 목록으로 돌아가기'
        }, '← 뒤로'),
        h('div', null,
          h('h1', { 
            className: 'text-2xl font-bold text-gray-800 chinese-character',
            'aria-level': '1'
          }, activity.chinese),
          h('p', { className: 'text-gray-600' }, `"${activity.meaning}"`)
        )
      ),
      h('div', { className: 'text-right' },
        h('div', { className: 'text-sm text-gray-500' },
          `난이도: ${activity.difficulty === 'beginner' ? '초급' : activity.difficulty === 'intermediate' ? '중급' : '고급'}`
        ),
        progress && h('div', { className: 'text-lg font-bold text-blue-600' },
          `${progress.correctAnswers.length} / ${activity.characters.length}`
        )
      )
    )
  );
}

// Pinyin Options Panel Component  
function PinyinOptionsPanel({ pinyinOptions, userAnswers, onDragStart, onDragEnd }) {
  const usedPinyins = Object.values(userAnswers).map(answer => answer.pinyin);
  
  return h('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
    h('h3', { 
      className: 'text-xl font-bold mb-4 text-gray-800',
      'aria-level': '3'
    }, '🎯 병음 선택'),
    h('div', { 
      className: 'flex flex-wrap gap-3 justify-center',
      role: 'group',
      'aria-label': '드래그 가능한 병음 옵션들'
    },
      ...pinyinOptions.map((pinyin, index) => {
        const isUsed = usedPinyins.includes(pinyin);
        return h('div', {
          key: `${pinyin}_${index}`,
          className: `px-6 py-3 rounded-xl cursor-grab font-bold transition-all duration-200 select-none ${
            isUsed 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 scale-95' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-lg active:scale-95'
          }`,
          draggable: !isUsed,
          onDragStart: (e) => !isUsed && onDragStart(e, { pinyin, index }),
          onDragEnd,
          role: 'button',
          tabIndex: isUsed ? -1 : 0,
          'aria-label': `병음 ${pinyin}${isUsed ? ' (이미 사용됨)' : ' (드래그하여 배치)'}`
        }, 
          pinyin,
          isUsed && h('span', { 
            className: 'ml-2 text-xs',
            'aria-hidden': 'true'
          }, '✓')
        );
      })
    )
  );
}

// Character Sentence Display Component
function CharacterSentenceDisplay({ activity, userAnswers, feedback, onDragOver, onDrop, submitting }) {
  if (!activity.characters || activity.characters.length === 0) {
    return h('div', { className: 'text-center py-8' },
      h('p', { className: 'text-gray-500' }, '문장 데이터를 불러오는 중...')
    );
  }

  return h('div', { className: 'bg-white rounded-lg shadow-lg p-8 mb-6' },
    h('div', { 
      className: 'text-center',
      role: 'main',
      'aria-label': '문장 연습 영역'
    },
      h('div', { className: 'inline-block py-8 px-6' },
        h('div', { 
          className: 'flex items-end justify-center gap-2 flex-wrap',
          role: 'group',
          'aria-label': '중국어 문장의 각 글자들'
        },
          ...activity.characters.map(character => 
            h(CharacterDropZone, {
              key: character.id,
              character,
              userAnswer: userAnswers[character.id],
              feedback: feedback[character.id],
              onDragOver,
              onDrop,
              submitting,
              settings: activity.settings
            })
          )
        )
      )
    )
  );
}

// Character Drop Zone Component
function CharacterDropZone({ character, userAnswer, feedback, onDragOver, onDrop, submitting, settings }) {
  const getFeedbackClass = () => {
    if (feedback) {
      if (feedback.type === 'success') return 'border-green-400 bg-green-50';
      if (feedback.type === 'error') return 'border-red-400 bg-red-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  const getPinyinClass = () => {
    if (feedback) {
      if (feedback.type === 'success') return 'bg-green-100 text-green-700 border-green-300';
      if (feedback.type === 'error') return 'bg-red-100 text-red-700 border-red-300';
    }
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return h('div', { 
    className: 'relative flex flex-col items-center mb-4',
    'aria-label': `글자 ${character.char}에 대한 병음 배치 영역`
  },
    // Pinyin Drop Area
    h('div', {
      className: `min-w-16 h-12 border-2 border-dashed rounded-lg flex items-center justify-center mb-2 transition-all duration-300 ${getFeedbackClass()} ${
        submitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:border-solid hover:shadow-md cursor-pointer'
      }`,
      onDragOver: (e) => {
        if (!submitting) {
          onDragOver(e);
          e.currentTarget.classList.add('scale-110', 'border-blue-400', 'bg-blue-100');
        }
      },
      onDragLeave: (e) => {
        if (!submitting) {
          e.currentTarget.classList.remove('scale-110', 'border-blue-400', 'bg-blue-100');
        }
      },
      onDrop: (e) => {
        if (!submitting) {
          onDrop(e, character);
          e.currentTarget.classList.remove('scale-110', 'border-blue-400', 'bg-blue-100');
        }
      },
      role: 'button',
      tabIndex: submitting ? -1 : 0,
      'aria-label': userAnswer ? `배치된 병음: ${userAnswer.pinyin}` : '병음을 여기에 드래그하세요',
      style: { 
        minHeight: `${Math.max(48, (settings?.pinyinFontSize || 24) + 16)}px`,
        minWidth: `${Math.max(64, (settings?.fontSize || 48) + 16)}px`
      }
    },
      userAnswer ? h('div', {
        className: `pinyin-text font-bold px-3 py-1 rounded-lg text-center shadow-sm transition-all duration-300 fade-in ${getPinyinClass()}`,
        style: { fontSize: `${settings?.pinyinFontSize || 24}px` }
      }, userAnswer.pinyin) : h('div', {
        className: 'text-gray-400 text-xs font-medium',
        'aria-hidden': 'true'
      }, '드래그')
    ),
    
    // Chinese Character
    h('div', {
      className: 'chinese-character font-black text-gray-800 leading-tight select-none',
      style: { 
        fontSize: `${settings?.fontSize || 48}px`,
        lineHeight: '0.9'
      },
      'aria-label': `중국어 글자: ${character.char}`
    }, character.char)
  );
}

// Progress Display Component
function ProgressDisplay({ progress, activity }) {
  if (!progress || !activity) return null;

  const percentage = activity.characters.length > 0 
    ? Math.round((progress.correctAnswers.length / activity.characters.length) * 100) 
    : 0;

  return h('div', { className: 'bg-white rounded-lg shadow-lg p-6' },
    h('h3', { 
      className: 'text-lg font-bold mb-4 text-gray-800',
      'aria-level': '3'
    }, '📊 진행 상황'),
    
    h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' },
      h('div', { className: 'text-center p-4 bg-blue-50 rounded-lg' },
        h('div', { className: 'text-2xl font-bold text-blue-600' }, progress.correctAnswers.length),
        h('div', { className: 'text-sm text-gray-600' }, '정답')
      ),
      h('div', { className: 'text-center p-4 bg-green-50 rounded-lg' },
        h('div', { className: 'text-2xl font-bold text-green-600' }, `${percentage}%`),
        h('div', { className: 'text-sm text-gray-600' }, '정확도')
      ),
      h('div', { className: 'text-center p-4 bg-purple-50 rounded-lg' },
        h('div', { className: 'text-2xl font-bold text-purple-600' }, progress.currentScore),
        h('div', { className: 'text-sm text-gray-600' }, '현재 점수')
      )
    ),
    
    h('div', { className: 'w-full bg-gray-200 rounded-full h-4' },
      h('div', { 
        className: 'bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500',
        style: { width: `${percentage}%` },
        role: 'progressbar',
        'aria-valuenow': percentage,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-label': `진행률 ${percentage}퍼센트`
      })
    )
  );
}

// Activity Results Component
function ActivityResults({ sessionData, onStartNew }) {
  const { progress, activity } = sessionData;
  const percentage = Math.round((progress.correctAnswers.length / activity.characters.length) * 100);
  
  return h('div', { className: 'max-w-4xl mx-auto p-6' },
    h('div', { className: 'bg-white rounded-xl shadow-lg p-8 text-center' },
      h('div', { className: 'mb-6' },
        h('div', { className: 'text-6xl mb-4' }, '🎉'),
        h('h1', { 
          className: 'text-3xl font-bold text-gray-800 mb-2',
          'aria-level': '1'
        }, '활동 완료!'),
        h('p', { className: 'text-xl text-gray-600' }, 
          `"${activity.meaning}" 문장을 완성했습니다!`
        )
      ),
      
      h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8' },
        h('div', { className: 'p-6 bg-blue-50 rounded-xl' },
          h('div', { className: 'text-3xl font-bold text-blue-600 mb-2' }, progress.correctAnswers.length),
          h('div', { className: 'text-sm text-gray-600' }, `/ ${activity.characters.length} 정답`)
        ),
        h('div', { className: 'p-6 bg-green-50 rounded-xl' },
          h('div', { className: 'text-3xl font-bold text-green-600 mb-2' }, `${percentage}%`),
          h('div', { className: 'text-sm text-gray-600' }, '정확도')
        ),
        h('div', { className: 'p-6 bg-purple-50 rounded-xl' },
          h('div', { className: 'text-3xl font-bold text-purple-600 mb-2' }, progress.currentScore),
          h('div', { className: 'text-sm text-gray-600' }, '최종 점수')
        )
      ),
      
      h('div', { className: 'mb-8' },
        h('div', { className: 'chinese-character text-4xl font-bold text-gray-800 mb-4' },
          activity.chinese
        ),
        h('div', { className: 'pinyin-text text-xl text-blue-600' },
          activity.pinyin.join(' ')
        )
      ),
      
      h('button', {
        onClick: onStartNew,
        className: 'px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl'
      }, '🚀 새로운 활동 시작하기')
    )
  );
}

// Utility Components
function LoadingSpinner({ message = '로딩 중...' }) {
  return h('div', { className: 'flex flex-col justify-center items-center min-h-screen' },
    h('div', { className: 'animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4' }),
    h('p', { className: 'text-gray-600 text-lg' }, message)
  );
}

function ErrorDisplay({ error, onRetry }) {
  return h('div', { className: 'flex flex-col justify-center items-center min-h-screen p-6' },
    h('div', { className: 'bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center' },
      h('div', { className: 'text-4xl mb-4' }, '❌'),
      h('h2', { 
        className: 'text-xl font-bold text-red-800 mb-2',
        'aria-level': '2'
      }, '오류가 발생했습니다'),
      h('p', { className: 'text-red-600 mb-6' }, error),
      h('button', {
        onClick: onRetry,
        className: 'px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors'
      }, '다시 시도하기')
    )
  );
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(h(V2EnhancedApp), document.getElementById('root'));
});