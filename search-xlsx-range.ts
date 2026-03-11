import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function searchXlsxRange() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // $id範囲で検索（164430の前後）
  const query = `$id >= 164400 and $id <= 164500 order by $id desc`;

  console.log('=== 655アプリの$id範囲検索（164400-164500） ===\n');

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  console.log(`取得件数: ${response.data.records.length}件\n`);

  let xlsxFound = 0;

  response.data.records.forEach((record: any, i: number) => {
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
            xlsxFiles.push(`  ${fieldKey}: ${file.name}`);
          }
        });
      }
    });

    if (xlsxFiles.length > 0) {
      console.log(`[xlsxあり] $id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場名: ${genba}`);
      console.log(`  ステータス: ${status}`);
      xlsxFiles.forEach(f => console.log(f));
      console.log('');
      xlsxFound++;
    } else if (recordId === 164430) {
      console.log(`[ターゲットレコード] $id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場名: ${genba}`);
      console.log(`  ステータス: ${status}`);
      console.log(`  添付ファイル:`);
      ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
        const field = record[fieldKey];
        if (field && field.value && field.value.length > 0) {
          console.log(`    ${fieldKey}:`);
          field.value.forEach((file: any) => {
            const isXlsx = file.name.toLowerCase().includes('xlsx');
            console.log(`      - ${file.name} ${isXlsx ? '★xlsx' : ''}`);
          });
        }
      });
      console.log('');
    }
  });

  console.log(`xlsxファイルが見つかったレコード: ${xlsxFound}件\n`);

  if (xlsxFound === 0) {
    console.log('xlsxファイルが見つかりませんでした。');
    console.log('クエリ2の条件で655アプリを検索します...\n');

    // クエリ2の条件（部門5、特定現場）
    const query2 = `KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") order by $id desc limit 100`;

    const response2 = await axios.get(url, {
      headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
      params: { app: KINTONE_APP_ID_655, query: query2 }
    });

    console.log(`655アプリ（クエリ2条件）: ${response2.data.records.length}件\n`);

    response2.data.records.forEach((record: any, i: number) => {
      const recordId = record.$id?.value;
      const kanriBangou = record.KANRIBANGOU?.value || 'なし';
      const genba = record.GENBA_OKYAKUSAMAMEI?.value || 'なし';
      const status = record.ステータス?.value || 'なし';
      const koujiKyoten = record.TEISHUTSUSAKIKYOTEN_LOOKUP?.value || 'なし';

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

      if (xlsxFiles.length > 0 || i < 5) {
        console.log(`[${i + 1}] $id: ${recordId}`);
        console.log(`  管理番号: ${kanriBangou}`);
        console.log(`  現場名: ${genba}`);
        console.log(`  工事拠点: ${koujiKyoten}`);
        console.log(`  ステータス: ${status}`);
        if (xlsxFiles.length > 0) {
          xlsxFiles.forEach(f => console.log(`  ★xlsx: ${f}`));
        }
        console.log('');
      }
    });
  }
}

searchXlsxRange().catch(console.error);
