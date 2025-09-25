import { Hono } from 'hono'
import { renderer } from './renderer'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

app.use(renderer)

// API route for getting all activities
app.get('/api/activities', async (c) => {
  try {
    const activitiesResponse = await fetch('https://3000-iuots20s8e6ues5mkijb0-6532622b.e2b.dev/static/activities.json')
    if (!activitiesResponse.ok) {
      throw new Error('Failed to load activities')
    }
    const data = await activitiesResponse.json()
    return c.json(data.activities)
  } catch (error) {
    return c.json({ error: 'Failed to load activities' }, 500)
  }
})

// API route for getting specific activity data
app.get('/api/activities/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const activitiesResponse = await fetch('https://3000-iuots20s8e6ues5mkijb0-6532622b.e2b.dev/static/activities.json')
    if (!activitiesResponse.ok) {
      throw new Error('Failed to load activities')
    }
    const data = await activitiesResponse.json()
    const activity = data.activities.find(act => act.id === id)
    
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
  return c.render(
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>중국어 한자 병음 매칭 액티비티</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>{`
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
        `}</style>
      </head>
      <body className="bg-gray-50">
        <div id="root"></div>
        <script type="text/babel" src="/static/app.js"></script>
      </body>
    </html>
  )
})

export default app
