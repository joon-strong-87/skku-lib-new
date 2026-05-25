export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { author, title } = req.query;
  if (!author) return res.status(400).json({ error: 'author 필요' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: `저자 "${author}"를 3~4문장으로 소개해줘. "${title}" 책의 저자야. 마크다운 없이 텍스트만.` }]
    })
  });

  const data = await response.json();
  const bio = data.content?.[0]?.text || '정보를 가져올 수 없어요.';
  res.status(200).json({ bio });
}
