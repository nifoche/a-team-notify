import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function searchXlsxIn655() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリの最新100件を取得
  const query = `order by $id desc limit 100`;

  console.log('=== 655アプリでxlsxファイルを検索 ===\n');

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  console.log(`取得件数: ${response.data.records.length}件\n`);

  let xlsxFound = 0;

  response.data.records.forEach((record: any, i: number) => {
    const recordId = record.$id?.value;
    const kanriBangou = record.KANRIBANGOU?.value || 'なし';
    const genbaName = record.GENBA_OKYAKUSAMAMEI?.value || 'なし';
    const status = record.ステータス?.value || 'なし';

    let xlsxFiles: string[] = [];

    // 添付ファイル_0, 添付ファイル_1, 添付ファイル_2をチェック
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
      console.log(`[レコード ${i + 1}] $id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場予定者名: ${genbaName}`);
      console.log(`  ステータス: ${status}`);
      xlsxFiles.forEach(f => console.log(f));
      console.log('');
      xlsxFound++;
    }
  });

  console.log(`=== xlsxファイルが見つかったレコード: ${xlsxFound}件 ===`);

  if (xlsxFound === 0) {
    console.log('\nxlsxファイルが含まれるレコードが見つかりませんでした。');
    console.log('655アプリの全添付ファイルを確認します...\n');

    let totalFiles = 0;
    response.data.records.slice(0, 10).forEach((record: any, i: number) => {
      console.log(`[レコード ${i + 1}] $id: ${record.$id?.value}, 管理番号: ${record.KANRIBANGOU?.value || 'なし'}`);

      ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
        const field = record[fieldKey];
        if (field && field.value && field.value.length > 0) {
          console.log(`  ${fieldKey}:`);
          field.value.forEach((file: any) => {
            console.log(`    - ${file.name}`);
            totalFiles++;
          });
        }
      });
      console.log('');
    });

    console.log(`\n合計添付ファイル数（最初の10件）: ${totalFiles}`);
  }
}

searchXlsxIn655().catch(console.error);
