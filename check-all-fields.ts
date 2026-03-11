import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function checkAllFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // xlsx添付ファイルがあるレコードを検索
  const query = `$id = 164430`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== xlsxファイルがあるレコードの全フィールド ===\n');
    console.log(`管理番号: ${record.KANRIBANGOU?.value}`);
    console.log(`現場名: ${record.GENBA_OKYAKUSAMAMEI?.value}\n`);

    // 全フィールドを表示
    Object.keys(record).forEach(key => {
      const field = record[key];
      const type = field.type;

      if (type === 'FILE') {
        const files = field.value || [];
        if (files.length > 0) {
          console.log(`${key} (${type}):`);
          files.forEach((file: any) => {
            console.log(`  - ${file.name}`);
          });
        }
      } else if (type === 'CHECK_BOX') {
        const values = field.value || [];
        if (values.length > 0) {
          console.log(`${key} (${type}): ${values.join(', ')}`);
        }
      } else if (type === 'SUBTABLE') {
        // サブテーブルはスキップ
      } else if (field.value) {
        const value = field.value.toString().substring(0, 200);
        if (value && value !== 'なし') {
          console.log(`${key} (${type}): ${value}`);
        }
      }
    });
  }
}

checkAllFields().catch(console.error);
