export default async function handler(req, res) {
  // CORS 헤더 설정 (로컬 개발 환경 및 다양한 도메인 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { author, title } = req.query;

  // 필수 파라미터 검증
  if (!author) {
    return res.status(400).json({ error: 'author 파라미터가 필요합니다.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // 최신 Haiku 모델명 확인 필요
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `저자 "${author}"를 3~4문장으로 소개해줘. "${title}" 책의 저자야. 확실하지 않은 정보는 포함하지 말고, 잘 모르면 솔직히 말해줘. 마크다운 없이 텍스트만.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API Error:', errorData);
      return res.status(response.status).json({ error: 'Claude API 호출 중 오류가 발생했습니다.' });
    }

    const data = await response.json();
    const bio = data.content?.[0]?.text || '정보를 가져올 수 없어요.';
    
    // JSON 응답임을 명시적으로 설정
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ bio });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
