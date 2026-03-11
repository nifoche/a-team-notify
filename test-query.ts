import 'dotenv/config';
import axios from 'axios';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || '';
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || '';
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';

async function testQuery() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // テスト1: 工事拠点を追加したクエリ
  const query1 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") order by UKETSUKEDATE desc limit 500`;

  console.log('=== テスト1: 工事拠点を追加 ===');
  console.log(`クエリ: ${query1}`);

  const response1 = await axios.get(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_API_TOKEN,
    },
    params: {
      app: KINTONE_APP_ID,
      query: query1,
    },
  });

  console.log(`取得件数: ${response1.data.records.length}件`);

  // 工事拠点ごとの集計
  const genbaCount = new Map<string, number>();
  response1.data.records.forEach((record: any) => {
    const genba = record.KOUJIKYOTEN?.value || '未設定';
    genbaCount.set(genba, (genbaCount.get(genba) || 0) + 1);
  });

  console.log('\n工事拠点別件数:');
  Array.from(genbaCount.entries()).forEach(([name, count]) => {
    console.log(`  ${name}: ${count}件`);
  });
}

testQuery().catch(console.error);
