export default async function handler(req, res) {
  const { path, ...query } = req.query

  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' })
    return
  }

  const params = new URLSearchParams(query).toString()
  const url = `https://api.weather-ai.co${path}${params ? `?${params}` : ''}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const apiRes = await fetch(url, {
      method: req.method,
      headers: { 'Authorization': `Bearer ${process.env.VITE_WEATHERAI_KEY}` },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const text = await apiRes.text()
    let data
    try { data = JSON.parse(text) } catch { data = { error: text } }

    console.log('[proxy]', req.method, url, '->', apiRes.status, JSON.stringify(data).slice(0, 200))

    // Forward the real status code — never swallow it as 500
    res.status(apiRes.status).json(data)
  } catch (err) {
    if (err.name === 'AbortError') {
      res.status(504).json({ error: 'Weather-AI request timed out. Try again.' })
    } else {
      res.status(502).json({ error: 'Proxy could not reach Weather-AI. Check your connection.' })
    }
  }
}
