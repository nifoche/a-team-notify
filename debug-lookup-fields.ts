import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function debugLookupFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // xlsxファイルが含まれているレコード
  const query = `GENBAMEI in ("ブランシュ　102号室", "寿がきや食品 本社（事務棟）") limit 2`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  console.log('=== 104アプリのルックアップフィールド ===\n');

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);

    console.log('\n  ルックアップフィールド:');
    Object.keys(record).forEach(key => {
      const field = record[key];

      // ルックアップフィールドを探す
      if (field.type === 'REFERENCE' || field.type === 'LOOKUP') {
        console.log(`    ${key} (${field.type}):`);
        console.log(`      値: ${field.value || 'なし'}`);
        if (field.lookup) {
          console.log(`      lookup.relatedApp: ${field.lookup.relatedApp}`);
          console.log(`      lookup.relatedKeyField: ${field.lookup.relatedKeyField}`);
          console.log(`      lookup.lookupKeyField: ${field.lookup.lookupKeyField}`);
        }
      }
    });

    console.log('\n  全フィールド（ルックアップ候補）:');
    Object.keys(record).forEach(key => {
      const field = record[key];
      const value = field.value?.toString().substring(0, 50) || '空';

      // 関連するフィールド名を特別表示
      if (key.includes('工事') || key.includes('依頼') || key.includes('請求') || key.includes('見積') || key.includes('完了')) {
        console.log(`    ${key} (${field.type}): ${value}`);
      }
    });

    console.log('\n---\n');
  });

  console.log('\n=== 104アプリのフィールドタイプ一覧 ===\n');

  if (response.data.records.length > 0) {
    const record = response.data.records[0];
    const fieldTypes = new Map<string, string[]>();

    Object.keys(record).forEach(key => {
      const field = record[key];
      const type = field.type;

      if (!fieldTypes.has(type)) {
        fieldTypes.set(type, []);
      }
      fieldTypes.get(type)!.push(key);
    });

    // ルックアップ/参照フィールドを優先表示
    ['REFERENCE', 'LOOKUP', 'RELATED_RECORDS'].forEach(type => {
      if (fieldTypes.has(type)) {
        console.log(`${type}:`);
        fieldTypes.get(type)!.forEach(field => {
          console.log(`  - ${field}`);
        });
        console.log('');
      }
    });

    // ファイルフィールド
    if (fieldTypes.has('FILE')) {
      console.log('FILE:');
      fieldTypes.get('FILE')!.forEach(field => {
        console.log(`  - ${field}`);
      });
      console.log('');
    }

    // サブテーブルフィールド
    if (fieldTypes.has('SUBTABLE')) {
      console.log('SUBTABLE:');
      fieldTypes.get('SUBTABLE')!.forEach(field => {
        console.log(`  - ${field}`);
      });
    }
  }
}

debugLookupFields().catch(console.error);
