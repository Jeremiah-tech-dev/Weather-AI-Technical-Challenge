export default async function handler(req, res) {
  const { path, ...query } = req.query

  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' })
    return
  }

  const params = new URLSearchParams(query).toString()
  const url = new URL(`https://api.weather-ai.co${path}`)
  if (params) url.search = params

  const attempt = async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    try {
      const apiRes = await fetch(url.toString(), {
        method: req.method,
        headers: { 'Authorization': `Bearer ${process.env.VITE_WEATHERAI_KEY}` },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const text = await apiRes.text()
      let data
      try { data = JSON.parse(text) } catch { data = { error: text } }
      return { status: apiRes.status, data }
    } catch (err) {
      clearTimeout(timeout)
      if (err.name === 'AbortError') return { status: 504, data: { error: 'Weather-AI request timed out. Try again.' } }
      return { status: 502, data: { error: 'Proxy could not reach Weather-AI.' } }
    }
  }

  let result = await attempt()

  // Retry up to 2 times on 500 or 504
  const delays = [1500, 3000]
  for (const delay of delays) {
    if (result.status !== 500 && result.status !== 504) break
    await new Promise(r => setTimeout(r, delay))
    result = await attempt()
  }

  res.status(result.status).json(result.data)
}
