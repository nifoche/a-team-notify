import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_655 = "655";
const KINTONE_API_TOKEN_655 = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function get655Form() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/app/form.json`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_655 },
    params: { app: KINTONE_APP_ID_655 }
  });

  console.log('=== 655アプリのフォーム定義 ===\n');

  // 「見積」を含むフィールドを検索
  console.log('=== 「見積」を含むフィールド ===\n');
  response.data.properties.forEach((prop: any) => {
    const label = prop.label;
    const code = prop.code;
    const type = prop.type;

    if (label && (label.includes('見積') || label.includes('ミツモ'))) {
      console.log(`フィールド名: ${label}`);
      console.log(`フィールドコード: ${code}`);
      console.log(`タイプ: ${type}`);

      if (type === 'CHECK_BOX') {
        console.log(`選択肢: ${prop.options ? Object.keys(prop.options).join(', ') : 'なし'}`);
      } else if (type === 'DROPDOWN') {
        console.log(`選択肢: ${prop.options ? Object.keys(prop.options).join(', ') : 'なし'}`);
      } else if (type === 'RADIO_BUTTON') {
        console.log(`選択肢: ${prop.options ? Object.keys(prop.options).join(', ') : 'なし'}`);
      }
      console.log('');
    }
  });

  // 全フィールド一覧
  console.log('\n=== 全フィールド一覧 ===\n');
  response.data.properties.forEach((prop: any) => {
    const label = prop.label || '(ラベルなし)';
    const code = prop.code;
    const type = prop.type;
    console.log(`${label} (${code}) [${type}]`);
  });
}

get655Form().catch(console.error);
