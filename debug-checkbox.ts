import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugCheckboxFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2と同じ条件
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") limit 20`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコード ===\n`);

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);

    // 全てのテーブル内のCHECK_BOXを確認
    Object.keys(record).forEach(key => {
      const field = record[key];

      if (field && field.type === "SUBTABLE" && field.value && field.value.length > 0) {
        field.value.forEach((row: any, rowIndex: number) => {
          Object.keys(row.value).forEach(rowKey => {
            const rowField = row.value[rowKey];

            // CHECK_BOXフィールドのみ表示
            if (rowField.type === "CHECK_BOX") {
              const values = rowField.value || [];
              if (values.length > 0) {
                const hasXlsx = values.some((v: string) => v.includes('xlsx'));
                console.log(`    ${key}[${rowIndex}].${rowKey}: ${values.join(', ')} ${hasXlsx ? '★xlsxあり' : ''}`);
              }
            }
          });
        });
      }
    });

    console.log('');
  });

  console.log('=== 期待される現場名 ===');
  console.log('1. Felicidade（フェリシダージ）　107号室');
  console.log('2. コナミスポーツ渋谷　８F');
}

debugCheckboxFields().catch(console.error);
