import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function checkXlsxRecords() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // xlsxファイルが含まれている現場名で検索
  const query = `GENBAMEI in ("ブランシュ　102号室", "寿がきや食品 本社（事務棟）") limit 5`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコード ===\n`);

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`  部門: ${record.BUMON?.value || 'なし'}`);
    console.log(`  工事拠点: ${record.KOUJIKYOTEN?.value || 'なし'}`);

    // 全てのCHECK_BOXフィールドを表示
    console.log('\n  CHECK_BOXフィールドの値:');
    Object.keys(record).forEach(key => {
      const field = record[key];

      if (field && field.type === "SUBTABLE" && field.value && field.value.length > 0) {
        field.value.forEach((row: any, rowIndex: number) => {
          Object.keys(row.value).forEach(rowKey => {
            const rowField = row.value[rowKey];

            if (rowField.type === "CHECK_BOX") {
              const values = rowField.value || [];
              console.log(`    ${key}[${rowIndex}].${rowKey}: ${values.length > 0 ? values.join(', ') : '空'}`);
            }
          });
        });
      }
    });

    console.log('\n---\n');
  });

  console.log('=== 期待される現場名（xlsxファイルあり） ===');
  console.log('1. ブランシュ　102号室 (26003462　ブランシュ②　0222.xlsx)');
  console.log('2. 寿がきや食品 本社（事務棟） (第１工場空調機配置（プロット図）.xlsx)');
}

checkXlsxRecords().catch(console.error);
