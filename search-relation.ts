import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 104アプリ（現場管理）
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function searchRelation() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2の条件で104アプリを検索
  const query104 = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") order by UKETSUKEDATE desc limit 20`;

  console.log('=== 104アプリ（クエリ2条件）で検索 ===\n');

  const response104 = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query: query104 }
  });

  console.log(`104アプリの検索結果: ${response104.data.records.length}件\n`);

  // 最初の10件について、655アプリを検索
  let found = 0;

  for (let i = 0; i < Math.min(10, response104.data.records.length); i++) {
    const record104 = response104.data.records[i];
    const recordId = record104.$id?.value;
    const genbamei = record104.GENBAMEI?.value || 'なし';
    const uketsukeDate = record104.UKETSUKEDATE?.value || 'なし';
    const kokuyakumei = record104.KOKYAKUMEI?.value || 'なし';

    console.log(`[${i + 1}] ${genbamei}`);
    console.log(`  $id: ${recordId}`);
    console.log(`  受付日: ${uketsukeDate}`);
    console.log(`  顧客名: ${kokuyakumei}`);

    // 655アプリで検索（現場名で部分一致）
    try {
      // 顧客名や現場名で検索
      let query655 = '';

      if (genbamei && genbamei !== 'なし') {
        // 現場名からキーワードを抽出
        const keywords = genbamei.split(/[\s　（）/]/).filter((k: string) => k.length > 2);
        if (keywords.length > 0) {
          query655 = `GENBA_OKYAKUSAMAMEI like "${keywords[0]}" limit 5`;
        }
      }

      if (query655) {
        const response655 = await axios.get(url, {
          headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
          params: { app: KINTONE_APP_ID_655, query: query655 }
        });

        if (response655.data.records.length > 0) {
          console.log(`  → 655アプリ: ${response655.data.records.length}件見つかりました`);

          response655.data.records.forEach((record655: any) => {
            const kanriBangou = record655.KANRIBANGOU?.value || 'なし';
            const genba = record655.GENBA_OKYAKUSAMAMEI?.value || 'なし';
            const status = record655.ステータス?.value || 'なし';

            console.log(`    - ${kanriBangou} / ${genba} / ${status}`);

            // xlsxファイルを確認
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
              found++;
            }
          });
        }
      }
    } catch (error) {
      // エラーは無視
    }

    console.log('');
  }

  console.log(`=== 結果: xlsxファイルが見つかった104アプリのレコード: ${found}件 ===\n`);

  // 655アプリでxlsxファイルが含まれるレコードを確認
  console.log('=== 655アプリでxlsxファイルが含まれるレコードを確認 ===\n');

  const query655Xlsx = `order by $id desc limit 50`;

  const response655Xlsx = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query: query655Xlsx }
  });

  let xlsxCount = 0;

  response655Xlsx.data.records.forEach((record655: any, i: number) => {
    const kanriBangou = record655.KANRIBANGOU?.value || 'なし';
    const genba = record655.GENBA_OKYAKUSAMAMEI?.value || 'なし';
    const status = record655.ステータス?.value || 'なし';

    let xlsxFiles: string[] = [];

    ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
      const field = record655[fieldKey];
      if (field && field.value && field.value.length > 0) {
        field.value.forEach((file: any) => {
          if (file.name.toLowerCase().includes('xlsx')) {
            xlsxFiles.push(file.name);
          }
        });
      }
    });

    if (xlsxFiles.length > 0) {
      console.log(`[${xlsxCount + 1}] ${kanriBangou} - ${genba}`);
      console.log(`  ステータス: ${status}`);
      xlsxFiles.forEach(file => console.log(`  - ${file}`));
      console.log('');
      xlsxCount++;
    }
  });

  console.log(`655アプリでxlsxファイルが見つかったレコード: ${xlsxCount}件`);
}

searchRelation().catch(console.error);
