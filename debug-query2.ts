import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugQuery2() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") limit 10`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコード ===\n`);

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  現場名(GENBAMEI): ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  工事拠点(KOUJIKYOTEN): ${record.KOUJIKYOTEN?.value || 'なし'}`);

    // 全てのフィールドを表示して「完了報告・請求」関連を探す
    Object.keys(record).forEach(key => {
      const field = record[key];

      // 「完了報告・請求」または「見積添付」を含むフィールド名を探す
      if (key.includes('完了報告') || key.includes('請求') || key.includes('見積')) {
        console.log(`  ${key}: ${JSON.stringify(field).substring(0, 200)}`);
      }

      // テーブル内もチェック
      if (field && field.type === "SUBTABLE" && field.value && field.value.length > 0) {
        field.value.forEach((row: any, rowIndex: number) => {
          Object.keys(row.value).forEach(rowKey => {
            const rowField = row.value[rowKey];
            // テーブル内の「完了報告・請求」関連フィールド
            if (rowKey.includes('完了報告') || rowKey.includes('請求') || rowKey.includes('見積')) {
              if (rowField.type === 'CHECK_BOX' || rowField.type === 'RADIO_BUTTON' || rowField.type === 'DROP_DOWN') {
                console.log(`    ${key}[${rowIndex}].${rowKey}: ${rowField.value?.join?.(', ') || rowField.value || 'なし'}`);
              } else {
                console.log(`    ${key}[${rowIndex}].${rowKey}: ${JSON.stringify(rowField).substring(0, 150)}`);
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

debugQuery2().catch(console.error);
