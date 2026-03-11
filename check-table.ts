import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function checkTableStructure() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  const query = `KOKYAKUMEI in ("業務用LP", "業務用修理") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス = "対応中" limit 5`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log("=== テーブル構造の確認 ===");
  const record = response.data.records[0];
  
  // 全てのテーブルフィールドを確認
  Object.keys(record).forEach(key => {
    const field = (record as any)[key];
    if (field && field.type === "SUBTABLE") {
      console.log(`\nテーブル: ${key}`);
      if (field.value && field.value.length > 0) {
        const firstRow = field.value[0];
        console.log("  フィールド:");
        Object.keys(firstRow.value).forEach(subKey => {
          const subField = firstRow.value[subKey];
          if (subField.type === "FILE") {
            console.log(`    ${subKey} (FILE):`);
            if (subField.value && subField.value.length > 0) {
              subField.value.forEach((file: any) => {
                console.log(`      - ${file.name} (${file.contentType})`);
              });
            }
          } else {
            console.log(`    ${subKey} (${subField.type})`);
          }
        });
      }
    }
  });
}

checkTableStructure().catch(console.error);
