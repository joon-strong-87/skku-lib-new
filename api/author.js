export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { author, title, isbn } = req.query;
  if (!author) return res.status(400).json({ error: 'author 필요' });

  const ALADIN_KEY = process.env.ALADIN_API_KEY;

  try {
    if (isbn) {
      const url = `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_KEY}&itemIdType=ISBN13&ItemId=${isbn}&output=js&Version=20131101&OptResult=authorInfo`;
      const aladinRes = await fetch(url);
      const text = await aladinRes.text();
      console.log('알라딘 응답:', text.substring(0, 500));
      const data = JSON.parse(text);
      const items = JSON.parse(data.item || '[]');
      const item = items[0];
      console.log('item subInfo:', JSON.stringify(item?.subInfo));
      console.log('description:', item?.description);

      if (item) {
        const bio = item.subInfo?.authorInfo?.[0]?.authorInfo
          || item.description
          || null;
        if (bio && bio.trim()) {
          return res.status(200).json({ bio: bio.trim() });
        }
      }
    }
    return res.status(200).json({ bio: '저자 소개 정보가 없어요.' });
  } catch (err) {
    console.error('에러:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
