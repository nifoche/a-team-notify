import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function testQuery() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  
  // GENBACODE（現場コード）でフィルタ
  const query1 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") order by UKETSUKEDATE desc limit 10`;

  console.log("=== テスト: GENBACODEの値を確認 ===");
  const response1 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query: query1 }
  });

  console.log(`取得件数: ${response1.data.records.length}件`);
  
  console.log("
GENBACODEの値一覧:");
  const genbaCodes = new Set<string>();
  response1.data.records.forEach((record: any) => {
    const code = record.GENBACODE?.value || "なし";
    genbaCodes.add(code);
  });
  
  Array.from(genbaCodes).forEach(code => {
    console.log(`  - ${code}`);
  });
}

testQuery().catch(console.error);
