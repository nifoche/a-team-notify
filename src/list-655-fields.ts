import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function list655Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 655アプリの1件を取得
  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 655アプリ（工事依頼・完了報告・請求）全フィールド一覧 ===\n');

    // フィールドタイプごとに分類
    const fieldTypes = new Map<string, any[]>();

    Object.keys(record).forEach(key => {
      const field = record[key];
      const type = field.type;

      if (!fieldTypes.has(type)) {
        fieldTypes.set(type, []);
      }
      fieldTypes.get(type)!.push({ key, field });
    });

    // 重要なフィールドタイプ順に表示
    const typeOrder = [
      'SINGLE_LINE_TEXT', 'NUMBER', 'FILE',
      'DROP_DOWN', 'RADIO_BUTTON', 'CHECK_BOX',
      'DATE', 'DATETIME', 'MULTI_LINE_TEXT',
      'LINK', 'USER_SELECT', 'STATUS'
    ];

    typeOrder.forEach(type => {
      if (fieldTypes.has(type)) {
        console.log(`### ${type}\n`);
        const fields = fieldTypes.get(type)!;
        fields.forEach(({ key, field }) => {
          console.log(`${key}:`);
          if (type === 'FILE') {
            const files = field.value || [];
            if (files.length > 0) {
              files.forEach((file: any) => {
                console.log(`  - ${file.name}`);
              });
            } else {
              console.log(`  （ファイルなし）`);
            }
          } else if (field.value && field.value !== 'なし' && field.value !== '') {
            const value = field.value.toString().substring(0, 100);
            console.log(`  ${value}`);
          }
          console.log('');
        });
      }
    });
  }
}

list655Fields().catch(console.error);
