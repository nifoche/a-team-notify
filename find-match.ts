import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 104アプリ（現場管理）
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function findMatch() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリのxlsxレコードの現場名
  const genbaName = "エリーズ・キッチン";

  console.log('=== 104アプリで現場名検索 ===\n');
  console.log(`現場名: ${genbaName}\n`);

  // 104アプリで現場名検索（部分一致）
  const query104 = `GENBAMEI like "${genbaName}" limit 10`;

  const response104 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104 }
  });

  console.log(`104アプリの検索結果: ${response104.data.records.length}件\n`);

  response104.data.records.forEach((record: any, i: number) => {
    const recordId = record.$id?.value;
    const genbamei = record.GENBAMEI?.value || 'なし';
    const uketsukeDate = record.UKETSUKEDATE?.value || 'なし';
    const status = record.ステータス?.value || 'なし';
    const bumon = record.BUMON?.value || 'なし';
    const koujiKyoten = record.KOUJIKYOTEN?.value || 'なし';

    console.log(`[${i + 1}] ${genbamei}`);
    console.log(`  $id: ${recordId}`);
    console.log(`  受付日: ${uketsukeDate}`);
    console.log(`  ステータス: ${status}`);
    console.log(`  部門: ${bumon}`);
    console.log(`  工事拠点: ${koujiKyoten}`);

    // クエリ2の条件をチェック
    const isQuery2Match =
      status && ['未着手', '対応中', '施工中'].includes(status) &&
      koujiKyoten && ['大阪店', '名古屋店', '埼玉店'].includes(koujiKyoten) &&
      bumon === '5';

    if (isQuery2Match) {
      console.log(`  ★クエリ2の条件を満たしています！`);
    }

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

    console.log(`管理番号: ${record.KANRIBANGOU?.value || 'なし'}`);
    console.log(`現場名: ${record.GENBA_OKYAKUSAMAMEI?.value || 'なし'}`);
    console.log(`ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`工事拠点: ${record.TEISHUTSUSAKIKYOTEN_LOOKUP?.value || 'なし'}`);
    console.log(`工事依頼日: ${record.SAGYOSHIJI?.value || 'なし'}`);
    console.log(`作業予定日: ${record.SAGYOSHIJI_YOTEIBI?.value || 'なし'}`);

    console.log('\n添付ファイル:');
    ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
      const field = record[fieldKey];
      if (field && field.value && field.value.length > 0) {
        console.log(`  ${fieldKey}:`);
        field.value.forEach((file: any) => {
          const isXlsx = file.name.toLowerCase().includes('xlsx');
          console.log(`    - ${file.name} ${isXlsx ? '★xlsx' : ''}`);
        });
      }
    });
  }

  console.log('\n=== 655アプリのクエリ2条件でxlsx検索 ===\n');

  // 655アプリでクエリ2の条件を適用してxlsx検索
  const query655All = `KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") order by $id desc limit 200`;

  const response655All = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query: query655All }
  });

  console.log(`655アプリ（クエリ2条件）: ${response655All.data.records.length}件\n`);

  let xlsxInQuery2 = 0;

  response655All.data.records.forEach((record: any) => {
    const recordId = record.$id?.value;
    const kanriBangou = record.KANRIBANGOU?.value || 'なし';
    const genba = record.GENBA_OKYAKUSAMAMEI?.value || 'なし';
    const status = record.ステータス?.value || 'なし';

    let xlsxFiles: string[] = [];

    ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
      const field = record[fieldKey];
      if (field && field.value && field.value.length > 0) {
        field.value.forEach((file: any) => {
          if (file.name.toLowerCase().includes('xlsx')) {
            xlsxFiles.push(file.name);
          }
        });
      }
    });

    if (xlsxFiles.length > 0) {
      console.log(`[xlsxあり] $id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場名: ${genba}`);
      console.log(`  ステータス: ${status}`);
      xlsxFiles.forEach(f => console.log(`  - ${f}`));
      console.log('');
      xlsxInQuery2++;
    }
  });

  console.log(`\nクエリ2条件でxlsxファイルが見つかったレコード: ${xlsxInQuery2}件`);
}

findMatch().catch(console.error);
