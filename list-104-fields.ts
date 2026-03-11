import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function list104Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 104アプリの全フィールド ===\n');

    Object.keys(record).forEach(key => {
      const field = record[key];
      const value = field.value?.toString().substring(0, 50) || '空';

      // 管理番号関連のフィールドを特別表示
      if (key.includes('KANRI') || key.includes('管理') || key.includes('番号') || key.includes('BANGOU')) {
        console.log(`★ ${key} (${field.type}): ${value}`);
      }
    });

    console.log('\n=== 655アプリとの関連フィールド候補 ===\n');

    // 関連レコード一覧フィールドを探す
    Object.keys(record).forEach(key => {
      const field = record[key];

      if (field.type === 'RELATED_RECORDS') {
        console.log(`${key} (${field.type}):`);
        if (field.related) {
          console.log(`  relatedApp: ${field.related.app}`);
          console.log(`  relatedKey: ${field.related.keyField}`);
          console.log(`  targetField: ${field.related.targetField}`);
        }
      }
    });
  }
}

list104Fields().catch(console.error);
