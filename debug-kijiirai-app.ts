import axios from "axios";

// genki-denkiの.envファイルから読み込み
const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 104アプリ（現場管理）
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function debugKojiiraiApp() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリでxlsxファイルが含まれているレコード
  const query104 = `GENBAMEI in ("ブランシュ　102号室", "寿がきや食品 本社（事務棟）") limit 2`;

  console.log('=== 104アプリ（現場管理）のレコード ===\n');
  const response104 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104 }
  });

  response104.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  $id: ${record.$id?.value}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  完了報告・請求件数: ${record.完了報告_請求件数?.value || 0}`);

    // 全フィールドから関連レコード一覧を探す
    console.log('\n  関連レコード一覧フィールド:');
    Object.keys(record).forEach(key => {
      const field = record[key];
      // 関連レコード一覧のタイプチェック
      if (field && (field.type === 'RELATED_RECORDS' || typeof field.related === 'object')) {
        console.log(`    ${key} (${field.type})`);
        if (field.related) {
          console.log(`      relatedApp: ${field.related.app}`);
          console.log(`      relatedKey: ${field.related.keyField}`);
          console.log(`      targetField: ${field.related.targetField}`);
        }
      }
    });

    console.log('');
  });

  console.log('\n=== 655アプリ（工事依頼・完了報告・請求）のレコード ===\n');
  // 655アプリで見積添付関連のレコードを検索
  const query655 = `完了報告・請求 like "ブランシュ" or 完了報告・請求 like "寿がきや食品" limit 10`;

  const response655 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query: query655 }
  });

  console.log(`取得件数: ${response655.data.records.length}件\n`);

  response655.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] $id: ${record.$id?.value}`);
    console.log(`  完了報告・請求: ${record.完了報告_請求?.value || 'なし'}`);

    // 「見積」「添付」を含むフィールドを探す
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (key.includes('見積') || key.includes('添付')) {
        if (field.type === 'FILE' && field.value && field.value.length > 0) {
          console.log(`  ${key} (FILE):`);
          field.value.forEach((file: any) => {
            const isXlsx = file.name.toLowerCase().includes('xlsx');
            console.log(`    - ${file.name} ${isXlsx ? '★xlsx' : ''}`);
          });
        } else if (field.type === 'CHECK_BOX') {
          console.log(`  ${key} (CHECK_BOX): ${field.value?.join(', ') || '空'}`);
        } else if (field.type === 'SUBTABLE') {
          console.log(`  ${key} (SUBTABLE):`);
          // サブテーブル内の処理
        }
      }
    });

    console.log('');
  });
}

debugKojiiraiApp().catch(console.error);
