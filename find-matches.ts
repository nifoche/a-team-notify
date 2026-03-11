import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 104アプリ（現場管理）
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function findMatches() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリでxlsxが見つかった管理番号
  const kanriBangou = "20260300699";

  console.log('=== 104アプリで「顧客用_管理番号」を検索 ===\n');
  console.log(`管理番号: ${kanriBangou}\n`);

  // 104アプリで「顧客用_管理番号」検索
  const query104 = `顧客用_管理番号 = "${kanriBangou}" limit 10`;

  const response104 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104 }
  });

  console.log(`104アプリの検索結果: ${response104.data.records.length}件\n`);

  if (response104.data.records.length > 0) {
    response104.data.records.forEach((record: any, i: number) => {
      console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
      console.log(`  $id: ${record.$id?.value}`);
      console.log(`  顧客用_管理番号: ${record.顧客用_管理番号?.value || 'なし'}`);
      console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
      console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);
      console.log(`  部門: ${record.BUMON?.value || 'なし'}`);
      console.log(`  工事拠点: ${record.KOUJIKYOTEN?.value || 'なし'}`);
      console.log('');
    });
  } else {
    console.log('104アプリに同じ管理番号のレコードが見つかりませんでした。');
    console.log('655アプリの管理番号フォーマットを確認します...\n');

    // 655アプリの最近10件の管理番号を確認
    const query655 = `order by $id desc limit 10`;

    const response655 = await axios.get(url, {
      headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
      params: { app: KINTONE_APP_ID_655, query: query655 }
    });

    console.log('655アプリの最近の管理番号:');
    response655.data.records.forEach((record: any) => {
      console.log(`  ${record.KANRIBANGOU?.value || 'なし'} - ${record.GENBA_OKYAKUSAMAMEI?.value || 'なし'}`);
    });

    console.log('\n104アプリの「顧客用_管理番号」を確認します...\n');

    // 104アプリの最近10件の管理番号を確認
    const query104Recent = `顧客用_管理番号 is not null order by $id desc limit 10`;

    const response104Recent = await axios.get(url, {
      headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
      params: { app: KINTONE_APP_ID_104, query: query104Recent }
    });

    console.log('104アプリの最近の「顧客用_管理番号」:');
    response104Recent.data.records.forEach((record: any) => {
      console.log(`  ${record.顧客用_管理番号?.value || 'なし'} - ${record.GENBAMEI?.value || 'なし'}`);
    });
  }

  console.log('\n=== 655アプリのxlsxレコード ===\n');
  const query655Xlsx = `$id = 164430`;

  const response655Xlsx = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query: query655Xlsx }
  });

  if (response655Xlsx.data.records.length > 0) {
    const record = response655Xlsx.data.records[0];
    console.log(`管理番号: ${record.KANRIBANGOU?.value || 'なし'}`);
    console.log(`現場予定者名: ${record.GENBA_OKYAKUSAMAMEI?.value || 'なし'}`);
    console.log(`ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`工事依頼日: ${record.SAGYOSHIJI?.value || 'なし'}`);
  }
}

findMatches().catch(console.error);
