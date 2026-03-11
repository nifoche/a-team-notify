import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugAllFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // xlsxファイルが含まれているレコード
  const query = `GENBAMEI in ("ブランシュ　102号室", "寿がきや食品 本社（事務棟）") limit 2`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコードの全フィールド ===\n`);

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`  部門: ${record.BUMON?.value || 'なし'}`);
    console.log(`  工事拠点: ${record.KOUJIKYOTEN?.value || 'なし'}`);

    console.log('\n  全フィールド（関連レコード一覧など含む）:');
    Object.keys(record).forEach(key => {
      const field = record[key];

      // 「完了」「報告」「請求」「見積」「xlsx」を含むフィールド名を特別表示
      const isTargetField = key.includes('完了') || key.includes('報告') || key.includes('請求') || key.includes('見積') || key.includes('xlsx');

      if (isTargetField) {
        console.log(`    ★ ${key} (${field.type}):`);

        if (field.type === 'SUBTABLE') {
          if (field.value && field.value.length > 0) {
            field.value.forEach((row: any, rowIndex: number) => {
              Object.keys(row.value).forEach(rowKey => {
                const rowField = row.value[rowKey];
                if (rowKey.includes('完了') || rowKey.includes('報告') || rowKey.includes('請求') || rowKey.includes('見積') || rowKey.includes('xlsx')) {
                  const value = rowField.type === 'CHECK_BOX' ? rowField.value?.join(', ') :
                               rowField.type === 'FILE' ? `${rowField.value?.length || 0}ファイル` :
                               rowField.value?.toString().substring(0, 100) || '空';
                  console.log(`      [${rowIndex}].${rowKey} (${rowField.type}): ${value}`);
                }
              });
            });
          }
        } else if (field.type === 'STATUS' || field.type === 'CHECK_BOX' || field.type === 'DROP_DOWN') {
          const value = field.value || '空';
          console.log(`      値: ${Array.isArray(value) ? value.join(', ') : value}`);
        } else {
          const value = field.value?.toString().substring(0, 100) || '空';
          console.log(`      値: ${value}`);
        }
      }
    });

    console.log('\n---\n');
  });

  console.log('=== 「完了報告・請求」関連のフィールド名を探す ===');
  const record = response.data.records[0];
  Object.keys(record).forEach(key => {
    const field = record[key];
    if (key.includes('完了') || key.includes('報告') || key.includes('請求') || key.includes('見積')) {
      console.log(`  ${key} (${field.type})`);
    }
  });
}

debugAllFields().catch(console.error);
