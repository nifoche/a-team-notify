import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function check655Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリの1件を取得
  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 655アプリの全フィールド ===\n');

    // 特に「見積」関連フィールドを探す
    console.log('=== 「見積」関連フィールド ===\n');
    Object.keys(record).forEach(key => {
      if (key.includes('見積') || key.includes('ミツモ')) {
        const field = record[key];
        const type = field.type;
        const value = field.value?.toString().substring(0, 200) || 'なし';
        console.log(`${key} (${type}): ${value}`);
      }
    });

    console.log('\n=== CHECK_BOXフィールド全て ===\n');
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (field.type === 'CHECK_BOX') {
        const values = field.value || [];
        const valueStr = values.length > 0 ? values.join(', ') : 'なし';
        console.log(`${key}: ${valueStr}`);
      }
    });

    console.log('\n=== 全フィールド一覧（タイプ別） ===\n');
    const fieldTypes = new Map<string, any[]>();
    Object.keys(record).forEach(key => {
      const field = record[key];
      const type = field.type;
      if (!fieldTypes.has(type)) {
        fieldTypes.set(type, []);
      }
      fieldTypes.get(type)!.push({ key, field });
    });

    fieldTypes.forEach((fields, type) => {
      console.log(`\n${type}:`);
      fields.forEach(({ key, field }) => {
        const value = field.value?.toString().substring(0, 100) || 'なし';
        console.log(`  ${key}: ${value}`);
      });
    });
  }
}

check655Fields().catch(console.error);
