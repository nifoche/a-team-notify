import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 104アプリ（現場管理）
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function findRelation() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリでxlsxが見つかったレコードの管理番号
  const kanriBangou = "20260300699";

  console.log('=== 104アプリで同じ管理番号を検索 ===\n');
  console.log(`管理番号: ${kanriBangou}\n`);

  // 104アプリで管理番号検索
  const query104 = `KANRIBANGOU_SEARCH = "${kanriBangou}" or KANRIBANGOU = "${kanriBangou}" limit 10`;

  const response104 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104 }
  });

  console.log(`104アプリの検索結果: ${response104.data.records.length}件\n`);

  response104.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  $id: ${record.$id?.value}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  管理番号_SEARCH: ${record.KANRIBANGOU_SEARCH?.value || 'なし'}`);
    console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`  部門: ${record.BUMON?.value || 'なし'}`);
    console.log(`  工事拠点: ${record.KOUJIKYOTEN?.value || 'なし'}`);
    console.log('');
  });

  console.log('\n=== 655アプリのxlsxレコード詳細 ===\n');
  const query655 = `$id = 164430`;

  const response655 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query: query655 }
  });

  if (response655.data.records.length > 0) {
    const record = response655.data.records[0];
    console.log(`レコード番号: ${record.レコード番号?.value || 'なし'}`);
    console.log(`管理番号: ${record.KANRIBANGOU?.value || 'なし'}`);
    console.log(`現場予定者名: ${record.GENBA_OKYAKUSAMAMEI?.value || 'なし'}`);
    console.log(`ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`工事依頼日: ${record.SAGYOSHIJI?.value || 'なし'}`);

    console.log('\n添付ファイル:');
    ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
      const field = record[fieldKey];
      if (field && field.value && field.value.length > 0) {
        console.log(`  ${fieldKey}:`);
        field.value.forEach((file: any) => {
          console.log(`    - ${file.name}`);
        });
      }
    });
  }

  console.log('\n=== 104アプリの全管理番号フィールド ===\n');
  const query104Fields = `limit 1`;

  const response104Fields = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104Fields }
  });

  if (response104Fields.data.records.length > 0) {
    const record = response104Fields.data.records[0];

    console.log('管理番号関連のフィールド:');
    Object.keys(record).forEach(key => {
      if (key.includes('KANRI') || key.includes('管理') || key.includes('番号')) {
        const field = record[key];
        const value = field.value?.toString().substring(0, 50) || '空';
        console.log(`  ${key} (${field.type}): ${value}`);
      }
    });
  }
}

findRelation().catch(console.error);
