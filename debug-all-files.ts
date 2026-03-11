import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugAllFiles() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  const query = `KOKYAKUMEI in ("業務用LP", "業務用修理") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス = "対応中" limit 20`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコードの全添付ファイルを確認 ===`);
  
  let totalFiles = 0;
  let xlsxFiles = 0;
  
  response.data.records.forEach((record: any, i: number) => {
    console.log(`
[レコード ${i + 1}] ${record.RECORDTITLE.value}`);
    
    // 全てのSUBTABLEフィールドを確認
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (field && field.type === "SUBTABLE" && field.value && field.value.length > 0) {
        console.log(`  ${key}:`);
        
        field.value.forEach((row: any, rowIndex: number) => {
          Object.keys(row.value).forEach(rowKey => {
            const rowField = row.value[rowKey];
            if (rowField.type === "FILE" && rowField.value && rowField.value.length > 0) {
              rowField.value.forEach((file: any) => {
                totalFiles++;
                const isXlsx = file.name.toLowerCase().includes("xlsx");
                if (isXlsx) xlsxFiles++;
                console.log(`    [${rowIndex}].${rowKey}: ${file.name} ${isXlsx ? "★xlsx" : ""}`);
              });
            }
          });
        });
      }
    });
  });
  
  console.log(`
=== サマリー ===`);
  console.log(`全添付ファイル数: ${totalFiles}`);
  console.log(`xlsxファイル数: ${xlsxFiles}`);
}

debugAllFiles().catch(console.error);
