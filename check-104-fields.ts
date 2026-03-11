import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function check104Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // クエリ2の条件で104アプリを検索
  const query = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中") order by UKETSUKEDATE desc limit 5`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  console.log('=== 104アプリのレコード（クエリ2条件） ===\n');

  response.data.records.forEach((record: any, i: number) => {
    const recordId = record.$id?.value;
    const genbamei = record.GENBAMEI?.value || 'なし';

    console.log(`[${i + 1}] ${genbamei} ($id: ${recordId})`);

    // 「見積」関連フィールドを確認
    console.log('  「見積」関連フィールド:');
    Object.keys(record).forEach(key => {
      if (key.includes('見積') || key.includes('ミツモ') || key.includes('完了') || key.includes('請求')) {
        const field = record[key];
        const type = field.type;
        if (type === 'CHECK_BOX') {
          const values = field.value || [];
          if (values.length > 0) {
            console.log(`    ${key} (${type}): ${values.join(', ')}`);
          }
        } else if (type === 'STATUS') {
          console.log(`    ${key} (${type}): ${field.value}`);
        } else if (type === 'NUMBER') {
          console.log(`    ${key} (${type}): ${field.value}`);
        } else if (field.value && field.value.toString() !== 'なし') {
          const value = field.value.toString().substring(0, 100);
          console.log(`    ${key} (${type}): ${value}`);
        }
      }
    });

    // CHECK_BOXフィールド全て（xlsxが含まれるか確認）
    console.log('  CHECK_BOXフィールド（xlsxチェック）:');
    let foundXlsxCheckbox = false;
    Object.keys(record).forEach(key => {
      const field = record[key];
      if (field.type === 'CHECK_BOX') {
        const values = field.value || [];
        if (values.length > 0) {
          const hasXlsx = values.some((v: string) => v.includes('xlsx') || v.includes('XLSX'));
          if (hasXlsx) {
            console.log(`    ${key}: ${values.join(', ')}`);
            foundXlsxCheckbox = true;
          }
        }
      }
    });

    if (!foundXlsxCheckbox) {
      console.log('    （xlsxを含むCHECK_BOX値なし）');
    }

    console.log('');
  });
}

check104Fields().catch(console.error);
