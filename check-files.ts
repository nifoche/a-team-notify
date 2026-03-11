import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function checkFiles() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  const query = `KOKYAKUMEI in ("業務用LP", "業務用修理") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス = "対応中" limit 10`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコードを確認 ===`);
  
  response.data.records.forEach((record: any, i: number) => {
    console.log(`\n[レコード ${i + 1}] ${record.RECORDTITLE.value}`);
    
    // 全てのテーブルの添付ファイルを確認
    const tables = [
      { name: "テーブル", data: record.テーブル },
      { name: "テーブル_0", data: record.テーブル_0 },
      { name: "テーブル_1", data: record.テーブル_1 },
      { name: "テーブル_2", data: record.テーブル_2 },
      { name: "テーブル_4", data: record.テーブル_4 },
    ];
    
    let hasXlsxFile = false;
    
    tables.forEach(({ name, data }) => {
      if (\!data || \!data.value) return;
      
      data.value.forEach((row: any, rowIndex: number) => {
        Object.keys(row.value).forEach(key => {
          const field = row.value[key];
          if (field.type === "FILE" && field.value && field.value.length > 0) {
            console.log(`  ${name}[${rowIndex}].${key}:`);
            field.value.forEach((file: any) => {
              console.log(`    - ${file.name} (${file.contentType})`);
              if (file.name.toLowerCase().includes("xlsx")) {
                hasXlsxFile = true;
              }
            });
          }
        });
      });
    });
    
    if (\!hasXlsxFile) {
      console.log("  xlsxファイルなし");
    }
  });
}

checkFiles().catch(console.error);
