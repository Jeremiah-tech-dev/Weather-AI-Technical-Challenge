export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks)

  try {
    const apiRes = await fetch('https://api.weather-ai.co/v1/trees/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_WEATHERAI_KEY}`,
        'Content-Type': req.headers['content-type'],
      },
      body,
    })

    const data = await apiRes.json().catch(() => ({}))
    res.status(apiRes.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
