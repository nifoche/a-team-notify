import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function checkMitsuteField() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 複数件取得して「見積添付」フィールドを確認
  const query = `order by $id desc limit 100`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  console.log('=== 655アプリ: 「見積添付」フィールドの確認 ===\n');

  let foundMitsute = false;
  let foundXlsxInMitsute = false;

  response.data.records.forEach((record: any) => {
    const recordId = record.$id?.value;
    const kanriBangou = record.KANRIBANGOU?.value || 'なし';
    const genba = record.GENBA_OKYAKUSAMAMEI?.value || 'なし';

    // 「見積添付」フィールドを確認
    const mitsuteField = record.見積添付;

    if (mitsuteField && mitsuteField.value && mitsuteField.value.length > 0) {
      foundMitsute = true;
      console.log(`$id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場名: ${genba}`);
      console.log(`  見積添付ファイル:`);

      mitsuteField.value.forEach((file: any) => {
        const isXlsx = file.name.toLowerCase().includes('xlsx');
        console.log(`    - ${file.name}${isXlsx ? ' ★xlsx!' : ''}`);
        if (isXlsx) {
          foundXlsxInMitsute = true;
        }
      });
      console.log('');
    }
  });

  if (!foundMitsute) {
    console.log('「見積添付」フィールドにファイルが含まれるレコードは見つかりませんでした。');
    console.log('\n=== FILEフィールド一覧 ===');
    response.data.records.slice(0, 1).forEach((record: any) => {
      console.log('\nFILEフィールド:');
      Object.keys(record).forEach(key => {
        const field = record[key];
        if (field.type === 'FILE') {
          console.log(`  ${key}: ${field.label || '(ラベルなし)'}`);
        }
      });
    });
  }

  if (foundXlsxInMitsute) {
    console.log('✅ 「見積添付」フィールドにxlsxファイルが見つかりました！');
  }
}

checkMitsuteField().catch(console.error);
