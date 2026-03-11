import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function checkLookupFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2の条件で104アプリを検索
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") order by UKETSUKEDATE desc limit 3`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  console.log('=== 104アプリのルックアップフィールド確認 ===\n');

  response.data.records.forEach((record: any, i: number) => {
    const recordId = record.$id?.value;
    const genbamei = record.GENBAMEI?.value || 'なし';
    const genbacode = record.GENBACODE?.value || 'なし';
    const recordbango = record.RECORDBANGO?.value || 'なし';

    console.log(`[${i + 1}] ${genbamei}`);
    console.log(`  $id: ${recordId}`);
    console.log(`  現場コード: ${genbacode}`);
    console.log(`  レコード番号: ${recordbango}`);

    // ルックアップフィールドを確認
    console.log(`  ルックアップフィールド:`);
    const lookupKeys = ['ルックアップ', 'ルックアップ_0'];

    lookupKeys.forEach(key => {
      const field = record[key];
      if (field && field.value && field.value !== 'なし') {
        console.log(`    ${key}: ${field.value}`);
      }
    });

    // 655アプリ関連のフィールドを確認
    console.log(`  655アプリ関連フィールド:`);
    Object.keys(record).forEach(key => {
      if (key.includes('655') || key.includes('工事') || key.includes('依頼') || key.includes('請求') || key.includes('見積')) {
        const field = record[key];
        const type = field.type;
        if (field.value && field.value !== 'なし') {
          const value = field.value.toString().substring(0, 100);
          console.log(`    ${key} (${type}): ${value}`);
        }
      }
    });

    console.log('');
  });

  console.log('\n=== 655アプリの管理番号で104アプリを検索 ===\n');

  // 655アプリの管理番号で104アプリを検索
  const KINTONE_APP_ID_655 = "655";
  const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

  const query655 = `order by $id desc limit 5`;

  const response655 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query: query655 }
  });

  response655.data.records.forEach((record655: any) => {
    const kanriBangou = record655.KANRIBANGOU?.value || 'なし';
    const genba = record655.GENBA_OKYAKUSAMAMEI?.value || 'なし';

    console.log(`655管理番号: ${kanriBangou}`);
    console.log(`  現場名: ${genba}`);

    // 104アプリで現場コードから検索
    if (kanriBangou && kanriBangou !== 'なし') {
      console.log(`  → 104アプリで検索: ${kanriBangou}`);
    }
    console.log('');
  });
}

checkLookupFields().catch(console.error);
