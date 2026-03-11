import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function listAllApiFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリの1件を取得
  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 104アプリの全フィールド（APIで取得可能） ===\n');

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

    // 関連レコード一覧フィールド（最優先）
    console.log('=== 関連レコード一覧フィールド（RELATED_RECORDS） ===\n');
    if (fieldTypes.has('RELATED_RECORDS')) {
      fieldTypes.get('RELATED_RECORDS')!.forEach(({ key, field }) => {
        console.log(`${key}:`);
        if (field.related) {
          console.log(`  related.app: ${field.related.app}`);
          console.log(`  related.keyField: ${field.related.keyField}`);
          console.log(`  related.targetField: ${field.related.targetField}`);
        } else {
          console.log(`  値: ${JSON.stringify(field.value).substring(0, 200)}...`);
        }
        console.log('');
      });
    } else {
      console.log('（なし）\n');
    }

    // ルックアップ/参照フィールド
    console.log('=== ルックアップ/参照フィールド（REFERENCE/LOOKUP） ===\n');
    ['REFERENCE', 'LOOKUP'].forEach(type => {
      if (fieldTypes.has(type)) {
        fieldTypes.get(type)!.forEach(({ key, field }) => {
          const value = field.value?.toString().substring(0, 100) || 'なし';
          console.log(`${key} (${type}): ${value}`);
        });
      }
    });
    console.log('');

    // 工事依頼・完了報告・請求関連フィールド
    console.log('=== 工事依頼・完了報告・請求関連フィールド ===\n');
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (key.includes('工事') || key.includes('依頼') || key.includes('請求') || key.includes('見積') || key.includes('完了')) {
        const value = field.value?.toString().substring(0, 100) || 'なし';
        console.log(`${key} (${field.type}): ${value}`);
      }
    });
    console.log('');

    // チェックボックスフィールド
    console.log('=== チェックボックスフィールド ===\n');
    if (fieldTypes.has('CHECK_BOX')) {
      fieldTypes.get('CHECK_BOX')!.forEach(({ key, field }) => {
        const values = field.value || [];
        if (values.length > 0) {
          console.log(`${key}: ${values.join(', ')}`);
        }
      });
    }
    console.log('');

    // ファイルフィールド（ルートレベルのみ）
    console.log('=== ファイルフィールド（ルートレベル） ===\n');
    if (fieldTypes.has('FILE')) {
      fieldTypes.get('FILE')!.forEach(({ key, field }) => {
        const count = field.value?.length || 0;
        if (count > 0) {
          console.log(`${key}: ${count}ファイル`);
          field.value.forEach((file: any) => {
            console.log(`  - ${file.name}`);
          });
        }
      });
    }
    console.log('');

    // 数値フィールド
    console.log('=== 数値フィールド（完了報告・請求件数など） ===\n');
    if (fieldTypes.has('NUMBER')) {
      fieldTypes.get('NUMBER')!.forEach(({ key, field }) => {
        if (key.includes('完了') || key.includes('請求') || key.includes('見積')) {
          const value = field.value || '0';
          console.log(`${key}: ${value}`);
        }
      });
    }
    console.log('');

    // フィールドタイプの統計
    console.log('=== フィールドタイプ統計 ===\n');
    fieldTypes.forEach((fields, type) => {
      console.log(`${type}: ${fields.length}フィールド`);
    });
  }
}

listAllApiFields().catch(console.error);
