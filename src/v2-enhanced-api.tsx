import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

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

// API Endpoints

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

// 6. Update activity settings
app.put('/api/v2/character-pinyin/activities/:id/settings', async (c) => {
  const activityId = c.req.param('id')
  const body = await c.req.json()
  
  try {
    // Validate settings
    const settings: Partial<ActivitySettings> = {}
    
    if (body.fontSize && body.fontSize >= 24 && body.fontSize <= 72) {
      settings.fontSize = body.fontSize
    }
    
    if (body.pinyinFontSize && body.pinyinFontSize >= 12 && body.pinyinFontSize <= 36) {
      settings.pinyinFontSize = body.pinyinFontSize
    }
    
    if (body.spacing && body.spacing >= 10 && body.spacing <= 50) {
      settings.spacing = body.spacing
    }
    
    if (typeof body.showMeaning === 'boolean') {
      settings.showMeaning = body.showMeaning
    }
    
    if (typeof body.enableHints === 'boolean') {
      settings.enableHints = body.enableHints
    }
    
    if (typeof body.shufflePinyin === 'boolean') {
      settings.shufflePinyin = body.shufflePinyin
    }
    
    if (body.timeLimit && body.timeLimit >= 0 && body.timeLimit <= 600) {
      settings.timeLimit = body.timeLimit
    }
    
    return c.json({
      success: true,
      data: { ...defaultSettings, ...settings }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update settings' }, 500)
  }
})

// 7. Get activity statistics
app.get('/api/v2/character-pinyin/activities/:id/stats', async (c) => {
  const activityId = c.req.param('id')
  
  try {
    const activity = enhancedActivities.find(a => a.id === activityId)
    if (!activity) {
      return c.json({ success: false, error: 'Activity not found' }, 404)
    }
    
    // Calculate statistics from progress store
    const sessions = Array.from(progressStore.values())
      .filter(p => p.activityId === activityId)
    
    const completedSessions = sessions.filter(s => s.status === 'completed')
    const averageScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.currentScore, 0) / completedSessions.length
      : 0
    
    const averageTime = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.timeSpent, 0) / completedSessions.length
      : 0
    
    return c.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        completionRate: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
        averageScore: Math.round(averageScore),
        averageTime: Math.round(averageTime),
        characterCount: activity.characters.length,
        difficulty: activity.difficulty
      }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get statistics' }, 500)
  }
})

// Fallback to original API for compatibility
app.get('/', (c) => {
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
      <div id="root"></div>
      <script src="/static/v2-enhanced-app.js"></script>
    </body>
    </html>
  `)
})

export default app