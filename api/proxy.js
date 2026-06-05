export default async function handler(req, res) {
  const { path, ...query } = req.query

  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' })
    return
  }

  const params = new URLSearchParams(query).toString()
  const url = `https://api.weather-ai.co${path}${params ? `?${params}` : ''}`

  try {
    const apiRes = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_WEATHERAI_KEY}`,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    const text = await apiRes.text()
    let data
    try { data = JSON.parse(text) } catch { data = { error: text } }

    res.status(apiRes.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
