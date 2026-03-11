import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function checkXlsxRecord() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // xlsx添付ファイルがあるレコードを検索
  const query = `order by $id desc limit 100`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  console.log('=== xlsxファイルがあるレコードのCHECK_BOXフィールドを確認 ===\n');

  let foundXlsx = false;

  for (const record of response.data.records) {
    const recordId = record.$id?.value;
    const kanriBangou = record.KANRIBANGOU?.value || 'なし';
    const genba = record.GENBA_OKYAKUSAMAMEI?.value || 'なし';

    // xlsxファイルの確認
    let hasXlsx = false;
    let xlsxFileName = '';

    ['添付ファイル_0', '添付ファイル_1', '添付ファイル_2'].forEach(fieldKey => {
      const field = record[fieldKey];
      if (field && field.value && field.value.length > 0) {
        field.value.forEach((file: any) => {
          if (file.name.toLowerCase().includes('xlsx')) {
            hasXlsx = true;
            xlsxFileName = file.name;
          }
        });
      }
    });

    if (hasXlsx) {
      foundXlsx = true;
      console.log(`[xlsxあり] $id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場名: ${genba}`);
      console.log(`  xlsxファイル: ${xlsxFileName}`);

      // CHECK_BOXフィールドの値を表示
      console.log(`  CHECK_BOXフィールド:`);
      const checkBoxKeys = [
        'チェックボックス_6', 'チェックボックス_4', 'チェックボックス_5',
        'チェックボックス_2', 'チェックボックス_3', 'チェックボックス_0',
        'チェックボックス_1', 'チェックボックス', 'GENKIDENKI_CHOSEI', 'SASHIMODOSHI'
      ];

      checkBoxKeys.forEach(key => {
        const field = record[key];
        if (field && field.value && field.value.length > 0) {
          console.log(`    ${key}: ${field.value.join(', ')}`);
        }
      });

      console.log('');
    }
  }

  if (!foundXlsx) {
    console.log('xlsxファイルが見つかりませんでした。');
  }
}

checkXlsxRecord().catch(console.error);
