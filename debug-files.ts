import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugFiles() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  // xlsxフィルタなしで取得
  const query = `KOKYAKUMEI in ("業務用LP", "業務用修理") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス = "対応中" limit 10`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコードを確認 ===`);
  
  response.data.records.forEach((record: any, i: number) => {
    console.log(`
[レコード ${i + 1}] ${record.RECORDTITLE.value}`);
    
    // テーブル_2に注目（完了報告・請求の可能性が高い）
    const table2 = record.テーブル_2;
    if (table2 && table2.value && table2.value.length > 0) {
      console.log("  テーブル_2:");
      table2.value.forEach((row: any, rowIndex: number) => {
        const files = row.value.添付ファイル_4;
        if (files && files.value && files.value.length > 0) {
          console.log(`    行${rowIndex}.添付ファイル_4:`);
          files.value.forEach((file: any) => {
            console.log(`      - ${file.name}`);
          });
        }
      });
    }
  });
}

debugFiles().catch(console.error);
