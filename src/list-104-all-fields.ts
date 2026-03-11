import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function list104Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリの1件を取得
  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 104アプリの全フィールド一覧 ===\n');

    // フィールドタイプごとに分類
    const fieldTypes = new Map<string, any[]>();

    Object.keys(record).forEach(key => {
      const field = record[key];
      const type = field.type;

      if (!fieldTypes.has(type)) {
        fieldTypes.set(type, []);
      }
      fieldTypes.get(type)!.push({ key, field });
    });

    // FILEフィールド（最優先）
    console.log('=== FILEフィールド ===\n');
    if (fieldTypes.has('FILE')) {
      fieldTypes.get('FILE')!.forEach(({ key, field }) => {
        console.log(`${key}:`);
        const files = field.value || [];
        if (files.length > 0) {
          files.forEach((file: any) => {
            console.log(`  - ${file.name}`);
          });
        } else {
          console.log(`  （ファイルなし）`);
        }
        console.log('');
      });
    } else {
      console.log('（なし）\n');
    }

    // CHECK_BOXフィールド
    console.log('=== CHECK_BOXフィールド ===\n');
    if (fieldTypes.has('CHECK_BOX')) {
      fieldTypes.get('CHECK_BOX')!.forEach(({ key, field }) => {
        const values = field.value || [];
        console.log(`${key}: ${values.length > 0 ? values.join(', ') : '（選択なし）'}`);
      });
    } else {
      console.log('（なし）');
    }
    console.log('');

    // 「見積」関連フィールド
    console.log('=== 「見積」関連フィールド ===\n');
    let found = false;
    Object.keys(record).forEach(key => {
      if (key.includes('見積') || key.includes('ミツモ') || key.includes('MITU')) {
        found = true;
        const field = record[key];
        const type = field.type;
        console.log(`${key} (${type}):`);
        if (type === 'FILE') {
          const files = field.value || [];
          if (files.length > 0) {
            files.forEach((file: any) => {
              console.log(`  - ${file.name}`);
            });
          } else {
            console.log(`  （ファイルなし）`);
          }
        } else if (type === 'CHECK_BOX') {
          const values = field.value || [];
          console.log(`  ${values.length > 0 ? values.join(', ') : '（選択なし）'}`);
        } else if (field.value) {
          const value = field.value.toString().substring(0, 200);
          console.log(`  ${value}`);
        }
        console.log('');
      }
    });
    if (!found) {
      console.log('（なし）\n');
    }

    // その他のフィールドタイプ統計
    console.log('=== フィールドタイプ統計 ===\n');
    fieldTypes.forEach((fields, type) => {
      console.log(`${type}: ${fields.length}フィールド`);
    });
  }
}

list104Fields().catch(console.error);
