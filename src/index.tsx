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

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>중국어 한자 병음 매칭 액티비티</title>
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
  </style>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script src="/static/app.js"></script>
</body>
</html>`)
})

export default app
