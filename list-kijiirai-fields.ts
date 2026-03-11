import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function listKojiiraiFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリの最新5件を取得
  const query = `order by $id desc limit 5`;

  console.log('=== 655アプリ（工事依頼・完了報告・請求）のフィールド構造 ===\n');

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  console.log(`取得件数: ${response.data.records.length}件\n`);

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 全フィールド一覧 ===\n');
    Object.keys(record).forEach(key => {
      const field = record[key];
      const value = field.value?.toString().substring(0, 50) || '空';

      console.log(`${key} (${field.type}): ${value}`);
    });

    console.log('\n=== 「見積」「添付」を含むフィールド ===\n');
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (key.includes('見積') || key.includes('添付')) {
        console.log(`${key} (${field.type})`);
        if (field.type === 'FILE' && field.value && field.value.length > 0) {
          field.value.forEach((file: any) => {
            const isXlsx = file.name.toLowerCase().includes('xlsx');
            console.log(`  - ${file.name} ${isXlsx ? '★xlsx' : ''}`);
          });
        } else if (field.type === 'SUBTABLE' && field.value && field.value.length > 0) {
          console.log(`  テーブル行数: ${field.value.length}`);
          field.value.forEach((row: any, rowIndex: number) => {
            Object.keys(row.value).forEach(rowKey => {
              const rowField = row.value[rowKey];
              if (rowKey.includes('見積') || rowKey.includes('添付')) {
                if (rowField.type === 'FILE' && rowField.value && rowField.value.length > 0) {
                  console.log(`    行${rowIndex}.${rowKey}:`);
                  rowField.value.forEach((file: any) => {
                    const isXlsx = file.name.toLowerCase().includes('xlsx');
                    console.log(`      - ${file.name} ${isXlsx ? '★xlsx' : ''}`);
                  });
                }
              }
            });
          });
        }
      }
    });

    console.log('\n=== CHECK_BOXフィールド ===\n');
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (field.type === 'CHECK_BOX') {
        const values = field.value || [];
        console.log(`${key}: ${values.length > 0 ? values.join(', ') : '空'}`);
      }
    });
  }
}

listKojiiraiFields().catch(console.error);
