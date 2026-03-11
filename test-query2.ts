import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function testQuery() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  const query1 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and KOKYAKUCODE in ("5122159", "5679005", "5122160") order by UKETSUKEDATE desc limit 500`;

  console.log("=== テスト1: 顧客コードを追加 ===");
  const response1 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query: query1 }
  });

  console.log(`取得件数: ${response1.data.records.length}件`);
  
  for (let i = 0; i < Math.min(3, response1.data.records.length); i++) {
    const record = response1.data.records[i];
    console.log(`  [${i + 1}] KOKYAKUCODE: ${record.KOKYAKUCODE?.value}, KOUJIKYOTEN: ${record.KOUJIKYOTEN?.value}`);
  }
}

testQuery().catch(console.error);
