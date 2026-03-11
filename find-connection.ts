import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 104アプリ（現場管理）
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function findConnection() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリでxlsxが含まれているレコード
  const query104 = `GENBAMEI in ("ブランシュ　102号室", "寿がきや食品 本社（事務棟）") limit 2`;

  console.log('=== 104アプリから655アプリへの関連を確認 ===\n');

  const response104 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104 }
  });

  for (const record104 of response104.data.records) {
    const genbamei = record104.GENBAMEI?.value || 'なし';
    const koujiIraiTenkiyou = record104.工事依頼転記用?.value || 'なし';
    const recordId = record104.$id?.value;

    console.log(`[104アプリ] ${genbamei}`);
    console.log(`  $id: ${recordId}`);
    console.log(`  工事依頼転記用: ${koujiIraiTenkiyou}`);
    console.log(`  完了報告・請求件数: ${record104.完了報告_請求件数?.value || 0}`);

    // 655アプリで同じ日付のレコードを検索
    if (koujiIraiTenkiyou && koujiIraiTenkiyou !== 'なし') {
      console.log(`\n  655アプリで工事依頼日 = "${koujiIraiTenkiyou}" を検索...`);

      // SAGYOSHIJIフィールドを検索（日付形式を合わせる）
      const query655 = `SAGYOSHIJI like "${koujiIraiTenkiyou}%" limit 10`;

      try {
        const response655 = await axios.get(url, {
          headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
          params: { app: KINTONE_APP_ID_655, query: query655 }
        });

        console.log(`  → ${response655.data.records.length}件見つかりました`);

        response655.data.records.forEach((record655: any) => {
          console.log(`    $id: ${record655.$id?.value}`);
          console.log(`    管理番号: ${record655.KANRIBANGOU?.value || 'なし'}`);
          console.log(`    現場予定者名: ${record655.GENBA_OKYAKUSAMAMEI?.value || 'なし'}`);
          console.log(`    工事依頼日: ${record655.SAGYOSHIJI?.value || 'なし'}`);

          // 添付ファイルを確認
          let hasXlsx = false;
          ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
            const field = record655[fieldKey];
            if (field && field.value && field.value.length > 0) {
              field.value.forEach((file: any) => {
                if (file.name.toLowerCase().includes('xlsx')) {
                  console.log(`      ★xlsx: ${file.name}`);
                  hasXlsx = true;
                }
              });
            }
          });

          if (hasXlsx) {
            console.log(`      → xlsxファイルあり！`);
          }
        });

      } catch (error) {
        console.log(`    エラー: ${error}`);
      }
    }

    console.log('\n---\n');
  }

  console.log('=== 104アプリと655アプリの関連方法を確認 ===\n');
  console.log('可能性:');
  console.log('1. 工事依頼転記用（DATE）→ 655アプリの工事依頼日');
  console.log('2. 顧客用_管理番号 → 655アプリの管理番号');
  console.log('3. 現場名 → 655アプリの現場予定者名');
  console.log('4. 関連レコード一覧フィールド（APIでは非表示）');
}

findConnection().catch(console.error);
