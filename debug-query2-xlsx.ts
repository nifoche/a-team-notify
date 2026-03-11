import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugQuery2Xlsx() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2と同じ条件（limitを増やす）
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") order by UKETSUKEDATE desc limit 500`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコードからxlsxを検索 ===\n`);

  let xlsxFound = 0;

  response.data.records.forEach((record: any, i: number) => {
    const recordTitle = record.RECORDTITLE?.value || 'No title';
    const genbamei = record.GENBAMEI?.value || 'なし';

    // 全てのテーブルをチェック
    const tables = [
      { name: 'テーブル', data: record.テーブル },
      { name: 'テーブル_0', data: record.テーブル_0 },
      { name: 'テーブル_1', data: record.テーブル_1 },
      { name: 'テーブル_2', data: record.テーブル_2 },
      { name: 'テーブル_4', data: record.テーブル_4 },
    ];

    let xlsxFiles: string[] = [];

    for (const { name, data } of tables) {
      if (!data || !data.value) continue;

      for (let rowIndex = 0; rowIndex < data.value.length; rowIndex++) {
        const row = data.value[rowIndex];

        const fileFields = [
          { name: '添付ファイル_0', data: row.value?.添付ファイル_0 },
          { name: '添付ファイル_4', data: row.value?.添付ファイル_4 },
        ];

        for (const { name: fname, data: files } of fileFields) {
          if (!files || !files.value || !Array.isArray(files.value)) continue;

          for (const file of files.value) {
            const fileName = file.name || '';
            if (fileName.toLowerCase().includes('xlsx')) {
              xlsxFiles.push(`  ${name}[${rowIndex}].${fname} = ${fileName}`);
            }
          }
        }
      }
    }

    if (xlsxFiles.length > 0) {
      console.log(`[レコード ${i + 1}] ${recordTitle}`);
      console.log(`  現場名: ${genbamei}`);
      xlsxFiles.forEach(f => console.log(f));
      console.log('');
      xlsxFound++;
    }
  });

  console.log(`=== xlsxファイルが見つかったレコード: ${xlsxFound}件 ===`);
  console.log('\n=== 期待される現場名 ===');
  console.log('1. Felicidade（フェリシダージ）　107号室');
  console.log('2. コナミスポーツ渋谷　８F');
}

debugQuery2Xlsx().catch(console.error);
