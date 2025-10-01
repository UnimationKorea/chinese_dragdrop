import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API route for getting all activity types
app.get('/api/activity-types', async (c) => {
  try {
    const activityTypes = [
      {
        "id": "word-pinyin-connection",
        "title": "단어 중국어 병음 연결",
        "description": "한자 단어와 병음을 드래그앤드롭으로 연결하는 액티비티",
        "icon": "🔤",
        "difficulty": "beginner"
      },
      {
        "id": "character-pinyin-connection", 
        "title": "문자 중국어 병음 연결",
        "description": "문장 속 각 글자 위에 올바른 병음을 배치하는 액티비티",
        "icon": "📝",
        "difficulty": "intermediate"
      }
    ];
    return c.json(activityTypes)
  } catch (error) {
    return c.json({ error: 'Failed to load activity types' }, 500)
  }
})

// API route for getting activities by type
app.get('/api/activities/:type', async (c) => {
  const type = c.req.param('type')
  try {
    if (type === 'word-pinyin-connection') {
      const wordActivities = [
      {
        "id": "basic-greetings",
        "title": "기본 인사말",
        "description": "중국어 기본 인사말 한자와 병음 매칭",
        "characters": [
          { "id": 1, "chinese": "你好", "pinyin": "nǐ hǎo", "meaning": "안녕하세요", "level": "beginner" },
          { "id": 2, "chinese": "谢谢", "pinyin": "xiè xiè", "meaning": "감사합니다", "level": "beginner" },
          { "id": 3, "chinese": "再见", "pinyin": "zài jiàn", "meaning": "안녕히 가세요", "level": "beginner" },
          { "id": 4, "chinese": "对不起", "pinyin": "duì bù qǐ", "meaning": "죄송합니다", "level": "beginner" },
          { "id": 5, "chinese": "没关系", "pinyin": "méi guān xì", "meaning": "괜찮습니다", "level": "beginner" }
        ],
        "settings": {
          "chineseFontSize": 48, "pinyinFontSize": 24, "gridColumns": 5, "spacing": 20,
          "showMeaning": true, "dragDirection": "both", "timeLimit": 0, "shuffleItems": true
        }
      },
      {
        "id": "numbers",
        "title": "숫자",
        "description": "중국어 숫자 한자와 병음 매칭",
        "characters": [
          { "id": 1, "chinese": "一", "pinyin": "yī", "meaning": "하나", "level": "beginner" },
          { "id": 2, "chinese": "二", "pinyin": "èr", "meaning": "둘", "level": "beginner" },
          { "id": 3, "chinese": "三", "pinyin": "sān", "meaning": "셋", "level": "beginner" },
          { "id": 4, "chinese": "四", "pinyin": "sì", "meaning": "넷", "level": "beginner" },
          { "id": 5, "chinese": "五", "pinyin": "wǔ", "meaning": "다섯", "level": "beginner" },
          { "id": 6, "chinese": "六", "pinyin": "liù", "meaning": "여섯", "level": "beginner" },
          { "id": 7, "chinese": "七", "pinyin": "qī", "meaning": "일곱", "level": "beginner" },
          { "id": 8, "chinese": "八", "pinyin": "bā", "meaning": "여덟", "level": "beginner" },
          { "id": 9, "chinese": "九", "pinyin": "jiǔ", "meaning": "아홉", "level": "beginner" },
          { "id": 10, "chinese": "十", "pinyin": "shí", "meaning": "열", "level": "beginner" }
        ],
        "settings": {
          "chineseFontSize": 52, "pinyinFontSize": 26, "gridColumns": 5, "spacing": 15,
          "showMeaning": true, "dragDirection": "both", "timeLimit": 300, "shuffleItems": true
        }
      },
      {
        "id": "family",
        "title": "가족",
        "description": "중국어 가족 관계 한자와 병음 매칭",
        "characters": [
          { "id": 1, "chinese": "爸爸", "pinyin": "bà ba", "meaning": "아버지", "level": "beginner" },
          { "id": 2, "chinese": "妈妈", "pinyin": "mā ma", "meaning": "어머니", "level": "beginner" },
          { "id": 3, "chinese": "哥哥", "pinyin": "gē ge", "meaning": "형, 오빠", "level": "beginner" },
          { "id": 4, "chinese": "弟弟", "pinyin": "dì di", "meaning": "남동생", "level": "beginner" },
          { "id": 5, "chinese": "姐姐", "pinyin": "jiě jie", "meaning": "언니, 누나", "level": "beginner" },
          { "id": 6, "chinese": "妹妹", "pinyin": "mèi mei", "meaning": "여동생", "level": "beginner" }
        ],
        "settings": {
          "chineseFontSize": 44, "pinyinFontSize": 22, "gridColumns": 3, "spacing": 25,
          "showMeaning": true, "dragDirection": "both", "timeLimit": 0, "shuffleItems": true
        }
      }
      ];
      return c.json(wordActivities)
    } else if (type === 'character-pinyin-connection') {
      const characterActivities = [
        {
          "id": "sentence-1",
          "title": "기본 문장 연습",
          "description": "간단한 중국어 문장의 각 글자에 병음 배치",
          "sentence": {
            "chinese": "你吃饭了吗？",
            "pinyin": ["nǐ", "chī", "fàn", "le", "ma"],
            "meaning": "당신은 밥을 먹었습니까?",
            "characters": [
              {"id": 1, "char": "你", "pinyin": "nǐ", "position": 0},
              {"id": 2, "char": "吃", "pinyin": "chī", "position": 1},
              {"id": 3, "char": "饭", "pinyin": "fàn", "position": 2},
              {"id": 4, "char": "了", "pinyin": "le", "position": 3},
              {"id": 5, "char": "吗", "pinyin": "ma", "position": 4}
            ]
          },
          "settings": {
            "fontSize": 48,
            "pinyinFontSize": 24,
            "spacing": 20,
            "showMeaning": true,
            "timeLimit": 0
          }
        },
        {
          "id": "sentence-2", 
          "title": "인사 표현",
          "description": "일상 인사말의 각 글자에 병음 배치",
          "sentence": {
            "chinese": "你好吗？",
            "pinyin": ["nǐ", "hǎo", "ma"],
            "meaning": "안녕하세요?",
            "characters": [
              {"id": 1, "char": "你", "pinyin": "nǐ", "position": 0},
              {"id": 2, "char": "好", "pinyin": "hǎo", "position": 1},
              {"id": 3, "char": "吗", "pinyin": "ma", "position": 2}
            ]
          },
          "settings": {
            "fontSize": 52,
            "pinyinFontSize": 26,
            "spacing": 25,
            "showMeaning": true,
            "timeLimit": 180
          }
        }
      ];
      return c.json(characterActivities)
    } else {
      return c.json({ error: 'Invalid activity type' }, 400)
    }
  } catch (error) {
    return c.json({ error: 'Failed to load activities' }, 500)
  }
})

// API route for getting specific activity data
app.get('/api/activity/:type/:id', async (c) => {
  const type = c.req.param('type')
  const id = c.req.param('id')
  try {
    // Get activities from the same data source
    const activitiesResponse = await app.request(`/api/activities/${type}`, {
      headers: c.req.header()
    });
    const activities = await activitiesResponse.json();
    const activity = activities.find(act => act.id === id)
    
    if (!activity) {
      // Return default activity if not found
      return c.json({
        id: "default",
        title: "기본 중국어 한자 병음 매칭",
        description: "기본 중국어 학습 액티비티",
        characters: [
          { id: 1, chinese: "你好", pinyin: "nǐ hǎo", meaning: "안녕하세요", level: "beginner" },
          { id: 2, chinese: "谢谢", pinyin: "xiè xiè", meaning: "감사합니다", level: "beginner" },
          { id: 3, chinese: "再见", pinyin: "zài jiàn", meaning: "안녕히 가세요", level: "beginner" },
          { id: 4, chinese: "学习", pinyin: "xué xí", meaning: "학습하다", level: "beginner" },
          { id: 5, chinese: "汉语", pinyin: "hàn yǔ", meaning: "중국어", level: "beginner" }
        ],
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
      })
    }
    
    return c.json(activity)
  } catch (error) {
    return c.json({ error: 'Failed to load activity' }, 500)
  }
})

// API route for saving activity data
app.post('/api/activities', async (c) => {
  const data = await c.req.json()
  // In a real app with D1 database, you'd save to database
  // For now, just return success
  return c.json({ success: true, data })
})

// ==========================================
// V2 ENHANCED CHARACTER-PINYIN ACTIVITY API
// ==========================================

// Types and Interfaces
interface CharacterData {
  id: string
  char: string
  pinyin: string
  tone: number
  position: number
}

interface SentenceData {
  id: string
  chinese: string
  pinyin: string[]
  meaning: string
  characters: CharacterData[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

interface ActivityProgress {
  activityId: string
  userId: string
  startTime: string
  completedCharacters: string[]
  correctAnswers: string[]
  incorrectAnswers: string[]
  currentScore: number
  totalScore: number
  timeSpent: number
  status: 'in_progress' | 'completed' | 'paused'
}

interface ActivitySettings {
  fontSize: number
  pinyinFontSize: number
  spacing: number
  showMeaning: boolean
  enableHints: boolean
  autoProgress: boolean
  timeLimit: number
  shufflePinyin: boolean
}

// Enhanced Activity Data
const enhancedActivities: SentenceData[] = [
  {
    id: "greeting-conversation",
    chinese: "你好吗？",
    pinyin: ["nǐ", "hǎo", "ma"],
    meaning: "안녕하세요?",
    difficulty: "beginner",
    tags: ["greeting", "question"],
    characters: [
      { id: "char_1", char: "你", pinyin: "nǐ", tone: 3, position: 0 },
      { id: "char_2", char: "好", pinyin: "hǎo", tone: 3, position: 1 },
      { id: "char_3", char: "吗", pinyin: "ma", tone: 0, position: 2 }
    ]
  },
  {
    id: "daily-introduction",
    chinese: "我叫李明。",
    pinyin: ["wǒ", "jiào", "lǐ", "míng"],
    meaning: "저는 이명이라고 합니다.",
    difficulty: "beginner", 
    tags: ["introduction", "name"],
    characters: [
      { id: "char_4", char: "我", pinyin: "wǒ", tone: 3, position: 0 },
      { id: "char_5", char: "叫", pinyin: "jiào", tone: 4, position: 1 },
      { id: "char_6", char: "李", pinyin: "lǐ", tone: 3, position: 2 },
      { id: "char_7", char: "明", pinyin: "míng", tone: 2, position: 3 }
    ]
  },
  {
    id: "time-expression",
    chinese: "现在几点？",
    pinyin: ["xiàn", "zài", "jǐ", "diǎn"],
    meaning: "지금 몇 시인가요?",
    difficulty: "intermediate",
    tags: ["time", "question"],
    characters: [
      { id: "char_8", char: "现", pinyin: "xiàn", tone: 4, position: 0 },
      { id: "char_9", char: "在", pinyin: "zài", tone: 4, position: 1 },
      { id: "char_10", char: "几", pinyin: "jǐ", tone: 3, position: 2 },
      { id: "char_11", char: "点", pinyin: "diǎn", tone: 3, position: 3 }
    ]
  },
  {
    id: "food-ordering",
    chinese: "我要一碗面条。",
    pinyin: ["wǒ", "yào", "yī", "wǎn", "miàn", "tiáo"],
    meaning: "면 한 그릇을 주세요.",
    difficulty: "intermediate",
    tags: ["food", "ordering", "measure"],
    characters: [
      { id: "char_12", char: "我", pinyin: "wǒ", tone: 3, position: 0 },
      { id: "char_13", char: "要", pinyin: "yào", tone: 4, position: 1 },
      { id: "char_14", char: "一", pinyin: "yī", tone: 1, position: 2 },
      { id: "char_15", char: "碗", pinyin: "wǎn", tone: 3, position: 3 },
      { id: "char_16", char: "面", pinyin: "miàn", tone: 4, position: 4 },
      { id: "char_17", char: "条", pinyin: "tiáo", tone: 2, position: 5 }
    ]
  }
]

// Default Settings
const defaultSettings: ActivitySettings = {
  fontSize: 48,
  pinyinFontSize: 24,
  spacing: 20,
  showMeaning: true,
  enableHints: true,
  autoProgress: false,
  timeLimit: 0,
  shufflePinyin: true
}

// In-memory storage (in production, use database)
const progressStore = new Map<string, ActivityProgress>()

// V2 API Endpoints

// 1. Get all enhanced character-pinyin activities
app.get('/api/v2/character-pinyin/activities', async (c) => {
  try {
    const activities = enhancedActivities.map(activity => ({
      id: activity.id,
      chinese: activity.chinese,
      meaning: activity.meaning,
      difficulty: activity.difficulty,
      tags: activity.tags,
      characterCount: activity.characters.length
    }))
    return c.json({ success: true, data: activities })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load activities' }, 500)
  }
})

// 2. Get specific activity by ID
app.get('/api/v2/character-pinyin/activities/:id', async (c) => {
  const activityId = c.req.param('id')
  
  try {
    const activity = enhancedActivities.find(a => a.id === activityId)
    if (!activity) {
      return c.json({ success: false, error: 'Activity not found' }, 404)
    }
    
    // Shuffle pinyin if requested
    const shufflePinyin = c.req.query('shuffle') === 'true'
    let pinyinOptions = [...activity.pinyin]
    if (shufflePinyin) {
      pinyinOptions = pinyinOptions.sort(() => Math.random() - 0.5)
    }
    
    return c.json({
      success: true,
      data: {
        ...activity,
        pinyinOptions,
        settings: defaultSettings
      }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load activity' }, 500)
  }
})

// 3. Start new activity session
app.post('/api/v2/character-pinyin/activities/:id/start', async (c) => {
  const activityId = c.req.param('id')
  const body = await c.req.json()
  const userId = body.userId || 'anonymous'
  
  try {
    const activity = enhancedActivities.find(a => a.id === activityId)
    if (!activity) {
      return c.json({ success: false, error: 'Activity not found' }, 404)
    }
    
    const sessionId = `${userId}_${activityId}_${Date.now()}`
    const progress: ActivityProgress = {
      activityId,
      userId,
      startTime: new Date().toISOString(),
      completedCharacters: [],
      correctAnswers: [],
      incorrectAnswers: [],
      currentScore: 0,
      totalScore: activity.characters.length * 10, // 10 points per character
      timeSpent: 0,
      status: 'in_progress'
    }
    
    progressStore.set(sessionId, progress)
    
    return c.json({
      success: true,
      data: {
        sessionId,
        progress,
        activity: {
          ...activity,
          pinyinOptions: activity.pinyin.sort(() => Math.random() - 0.5)
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to start activity' }, 500)
  }
})

// 4. Submit answer for character
app.post('/api/v2/character-pinyin/sessions/:sessionId/answer', async (c) => {
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json()
  
  try {
    const progress = progressStore.get(sessionId)
    if (!progress) {
      return c.json({ success: false, error: 'Session not found' }, 404)
    }
    
    const activity = enhancedActivities.find(a => a.id === progress.activityId)
    if (!activity) {
      return c.json({ success: false, error: 'Activity not found' }, 404)
    }
    
    const { characterId, submittedPinyin, timeSpent } = body
    const character = activity.characters.find(c => c.id === characterId)
    
    if (!character) {
      return c.json({ success: false, error: 'Character not found' }, 404)
    }
    
    const isCorrect = character.pinyin === submittedPinyin
    
    // Update progress
    if (!progress.completedCharacters.includes(characterId)) {
      progress.completedCharacters.push(characterId)
      
      if (isCorrect) {
        progress.correctAnswers.push(characterId)
        progress.currentScore += 10 // Base score
        
        // Time bonus (faster answers get more points)
        if (timeSpent && timeSpent < 5000) {
          const timeBonus = Math.max(0, 5 - Math.floor(timeSpent / 1000))
          progress.currentScore += timeBonus
        }
      } else {
        progress.incorrectAnswers.push(characterId)
      }
    }
    
    progress.timeSpent += timeSpent || 0
    
    // Check if activity is completed
    if (progress.completedCharacters.length === activity.characters.length) {
      progress.status = 'completed'
    }
    
    progressStore.set(sessionId, progress)
    
    return c.json({
      success: true,
      data: {
        isCorrect,
        character,
        progress,
        feedback: isCorrect 
          ? { type: 'success', message: '정답입니다!' }
          : { type: 'error', message: `틀렸습니다. 정답은 "${character.pinyin}"입니다.` }
      }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to submit answer' }, 500)
  }
})

// 5. Get session progress
app.get('/api/v2/character-pinyin/sessions/:sessionId/progress', async (c) => {
  const sessionId = c.req.param('sessionId')
  
  try {
    const progress = progressStore.get(sessionId)
    if (!progress) {
      return c.json({ success: false, error: 'Session not found' }, 404)
    }
    
    return c.json({ success: true, data: progress })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get progress' }, 500)
  }
})

// Default route - Version selector
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>중국어 한자 병음 매칭 액티비티</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .chinese-character {
                font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
            }
            .version-card {
                transition: all 0.3s ease;
                transform: translateY(0);
            }
            .version-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="max-w-6xl mx-auto p-8">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold text-gray-800 mb-4 chinese-character">
                    🎯 중국어 한자 병음 학습 플랫폼
                </h1>
                <p class="text-xl text-gray-600">
                    원하는 버전을 선택하여 학습을 시작하세요
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <!-- V1 Original Version -->
                <div class="version-card bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <div class="text-center mb-6">
                        <div class="text-4xl mb-4">📚</div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">V1 기본 버전</h2>
                        <p class="text-gray-600">기본적인 드래그앤드롭 학습 활동</p>
                    </div>
                    
                    <div class="space-y-3 mb-6">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            단어-병음 연결 활동
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            문자-병음 연결 활동
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            기본 편집 기능
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            간단한 점수 표시
                        </div>
                    </div>
                    
                    <a href="/v1" class="block w-full px-6 py-3 bg-blue-500 text-white font-bold text-center rounded-lg hover:bg-blue-600 transition-colors">
                        V1 버전 시작하기
                    </a>
                </div>
                
                <!-- V2 Enhanced Version -->
                <div class="version-card bg-white rounded-xl shadow-lg p-8 border-2 border-indigo-300 relative">
                    <div class="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        NEW
                    </div>
                    <div class="text-center mb-6">
                        <div class="text-4xl mb-4">🚀</div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">V2 Enhanced 버전</h2>
                        <p class="text-gray-600">완전한 활동 템플릿 구현</p>
                    </div>
                    
                    <div class="space-y-3 mb-6">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            RESTful API 구조
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            진행상황 추적 시스템
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            고급 점수 및 통계
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            접근성 최적화
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✅</span>
                            모듈화된 컴포넌트
                        </div>
                    </div>
                    
                    <a href="/v2" class="block w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-center rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all">
                        V2 Enhanced 시작하기
                    </a>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">🎵 외부 액티비티</h3>
                    <a href="/external/tone-activity" class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
                        성조 학습 액티비티 →
                    </a>
                    <p class="text-sm text-gray-500 mt-2">
                        중국어 글자 위에 올바른 성조를 드래그하여 배치하는 독립 액티비티
                    </p>
                </div>
                <p class="text-gray-500 text-sm">
                    💡 V2 Enhanced 버전은 완전한 활동 템플릿 가이드를 따라 개발되었습니다
                </p>
            </div>
        </div>
    </body>
    </html>
  `)
})

// V1 Original Version Route
app.get('/v1', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>V1 중국어 한자 병음 매칭 액티비티</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone@7.23.6/babel.min.js"></script>
        <style>
            .chinese-character {
                font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
            }
            .pinyin-text {
                font-family: 'Times New Roman', serif;
            }
            .drag-item {
                transition: all 0.2s ease;
                cursor: grab;
            }
            .drag-item:active {
                cursor: grabbing;
            }
            .drop-zone {
                border: 2px dashed #d1d5db;
                transition: all 0.2s ease;
            }
            .drop-zone.drag-over {
                border-color: #3b82f6;
                background-color: #eff6ff;
            }
            .drop-zone.correct {
                border-color: #10b981;
                background-color: #d1fae5;
            }
            .drop-zone.incorrect {
                border-color: #ef4444;
                background-color: #fee2e2;
            }
            @keyframes fadeIn {
                0% {
                    opacity: 0;
                    transform: scale(0.8);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
            .drop-zone:hover {
                animation: bounce 0.6s;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="p-4">
            <div class="mb-4 text-center">
                <a href="/" class="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
                    ← 버전 선택으로 돌아가기
                </a>
            </div>
            <div id="root"></div>
        </div>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// V2 Enhanced Version Route
app.get('/v2', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>V2 Enhanced Character-Pinyin Learning Activity</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <style>
            .chinese-character {
                font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
            }
            .pinyin-text {
                font-family: 'Times New Roman', serif;
            }
            .fade-in {
                animation: fadeIn 0.5s ease-in;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .bounce {
                animation: bounce 0.6s;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="p-4">
            <div class="mb-4 text-center">
                <a href="/" class="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
                    ← 버전 선택으로 돌아가기
                </a>
            </div>
            <div id="root"></div>
        </div>
        <script src="/static/v2-enhanced-app.js"></script>
    </body>
    </html>
  `)
})

// ==========================================
// 외부 액티비티 - 성조 학습 (완전히 독립적)
// Core 시스템에 영향 없음
// ==========================================

app.get('/external/tone-activity', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>중국어 성조 학습 액티비티</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <style>
            .chinese-character {
                font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
            }
            .tone-drag-item {
                transition: all 0.3s ease;
                cursor: grab;
            }
            .tone-drag-item:active {
                cursor: grabbing;
            }
            .tone-drop-zone {
                border: 2px dashed #d1d5db;
                transition: all 0.3s ease;
            }
            .tone-drop-zone:hover {
                animation: pulse 0.6s;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .fade-in {
                animation: fadeIn 0.5s ease-in;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
        <div class="p-4">
            <div class="mb-4 text-center">
                <a href="/" class="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
                    ← 메인으로 돌아가기
                </a>
            </div>
            <div id="root"></div>
        </div>
        <script src="/static/tone-activity.js"></script>
    </body>
    </html>
  `)
})

export default app
