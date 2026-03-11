import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugXlsxCheckbox() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2と同じ条件
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") limit 100`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコード ===\n`);

  let xlsxCheckboxCount = 0;
  let xlsxFileCount = 0;

  response.data.records.forEach((record: any, i: number) => {
    const recordTitle = record.RECORDTITLE?.value || 'No title';
    const genbamei = record.GENBAMEI?.value || 'なし';

    let hasXlsxCheckbox = false;
    let hasXlsxFile = false;
    let xlsxDetails: string[] = [];

    // テーブル_2のチェックボックス_11を確認
    const table2 = record.テーブル_2;
    if (table2 && table2.value && table2.value.length > 0) {
      table2.value.forEach((row: any, rowIndex: number) => {
        const checkbox = row.value.チェックボックス_11;
        if (checkbox && checkbox.value && Array.isArray(checkbox.value)) {
          const hasXlsxValue = checkbox.value.some((v: string) => v.toLowerCase().includes('xlsx'));
          if (hasXlsxValue) {
            hasXlsxCheckbox = true;
            xlsxDetails.push(`テーブル_2[${rowIndex}].チェックボックス_11 = ${checkbox.value.join(', ')}`);
          }
        }

        // 添付ファイル_4も確認
        const files = row.value.添付ファイル_4;
        if (files && files.value && files.value.length > 0) {
          files.value.forEach((file: any) => {
            if (file.name.toLowerCase().includes('xlsx')) {
              hasXlsxFile = true;
              xlsxDetails.push(`テーブル_2[${rowIndex}].添付ファイル_4 = ${file.name}`);
            }
          });
        }
      });
    }

    if (hasXlsxCheckbox || hasXlsxFile) {
      console.log(`[レコード ${i + 1}] ${recordTitle}`);
      console.log(`  現場名: ${genbamei}`);
      xlsxDetails.forEach(detail => console.log(`  ${detail}`));
      console.log('');
      if (hasXlsxCheckbox) xlsxCheckboxCount++;
      if (hasXlsxFile) xlsxFileCount++;
    }
  });

  console.log('=== サマリー ===');
  console.log(`チェックボックスに[xlsx]含む: ${xlsxCheckboxCount}件`);
  console.log(`添付ファイルにxlsx含む: ${xlsxFileCount}件`);
  console.log('\n=== 期待される現場名 ===');
  console.log('1. Felicidade（フェリシダージ）　107号室');
  console.log('2. コナミスポーツ渋谷　８F');
}

debugXlsxCheckbox().catch(console.error);
