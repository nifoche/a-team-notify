import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function findCheckboxField() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2の条件でxlsxを含むレコードを探す
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") limit 10`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコードからCHECK_BOXフィールドを探索 ===\n`);

  const allCheckboxFields = new Set<string>();

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);

    // 全てのテーブル内のCHECK_BOXフィールド名を収集
    Object.keys(record).forEach(key => {
      const field = record[key];

      if (field && field.type === "SUBTABLE" && field.value && field.value.length > 0) {
        field.value.forEach((row: any, rowIndex: number) => {
          Object.keys(row.value).forEach(rowKey => {
            const rowField = row.value[rowKey];

            if (rowField.type === "CHECK_BOX") {
              allCheckboxFields.add(`${key}.${rowKey}`);

              // フィールド名に「完了」「報告」「請求」「見積」が含まれるものを特別表示
              if (rowKey.includes('完了') || rowKey.includes('報告') || rowKey.includes('請求') || rowKey.includes('見積')) {
                const values = rowField.value || [];
                console.log(`  ★ ${key}[${rowIndex}].${rowKey}: ${values.length > 0 ? values.join(', ') : '空'}`);
              }
            }
          });
        });
      }
    });

    console.log('');
  });

  console.log('=== 全CHECK_BOXフィールド一覧 ===');
  Array.from(allCheckboxFields).sort().forEach(field => {
    console.log(`  - ${field}`);
  });

  console.log('\n=== 「完了報告・請求アプリ(見積添付)」を含むフィールド名を探す ===');
  Array.from(allCheckboxFields).forEach(field => {
    if (field.includes('完了') || field.includes('報告') || field.includes('請求') || field.includes('見積')) {
      console.log(`  ★ ${field}`);
    }
  });
}

findCheckboxField().catch(console.error);
