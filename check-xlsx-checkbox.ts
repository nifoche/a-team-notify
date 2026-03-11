import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function checkXlsxCheckbox() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2の条件に合致する現場名で655アプリを検索
  const query = `order by $id desc limit 50`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  console.log('=== 655アプリ: xlsxファイルとCHECK_BOXフィールドの確認 ===\n');

  let foundXlsx = 0;

  response.data.records.forEach((record: any) => {
    const recordId = record.$id?.value;
    const kanriBangou = record.KANRIBANGOU?.value || 'なし';
    const genba = record.GENBA_OKYAKUSAMAMEI?.value || 'なし';

    // xlsxファイルの確認
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

    if (xlsxFiles.length > 0 || foundXlsx < 3) {
      console.log(`$id: ${recordId}`);
      console.log(`  管理番号: ${kanriBangou}`);
      console.log(`  現場名: ${genba}`);

      if (xlsxFiles.length > 0) {
        xlsxFiles.forEach(f => console.log(`  ★xlsx: ${f}`));
        foundXlsx++;
      }

      // CHECK_BOXフィールド全て
      console.log(`  CHECK_BOXフィールド:`);
      const checkBoxKeys = [
        'チェックボックス_6', 'チェックボックス_4', 'チェックボックス_5',
        'チェックボックス_2', 'チェックボックス_3', 'チェックボックス_0',
        'チェックボックス_1', 'チェックボックス', 'GENKIDENKI_CHOSEI', 'SASHIMODOSHI'
      ];

      let hasCheckBox = false;
      checkBoxKeys.forEach(key => {
        const field = record[key];
        if (field && field.value && field.value.length > 0) {
          const values = field.value.join(', ');
          const hasXlsx = field.value.some((v: string) => v.includes('xlsx') || v.includes('XLSX'));
          console.log(`    ${key}: ${values}${hasXlsx ? ' ★xlsx!' : ''}`);
          hasCheckBox = true;
        }
      });

      if (!hasCheckBox) {
        console.log(`    （CHECK_BOX選択なし）`);
      }

      console.log('');
    }
  });
}

checkXlsxCheckbox().catch(console.error);
