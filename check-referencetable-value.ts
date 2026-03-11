import axios from 'axios';

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_104_TOKEN = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function checkReferenceTableValue() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  console.log('=== 104アプリのREFERENCE_TABLEフィールド値確認 ===\n');

  // サンプルレコードを1件取得
  const query = `limit 3`;

  const response = await axios.get(url, {
    headers: { 'X-Cybozu-API-Token': KINTONE_104_TOKEN },
    params: { app: '104', query }
  });

  console.log(`取得件数: ${response.data.records.length}\n`);

  for (const record of response.data.records) {
    const id = (record as any).$id?.value;
    const genbamei = (record as any).GENBAMEI?.value || '(なし)';
    const kokyakumei = (record as any).KOKYAKUMEI?.value || '(なし)';

    console.log(`レコードID: ${id}`);
    console.log(`現場名: ${genbamei}`);
    console.log(`顧客名: ${kokyakumei}`);

    // 完了報告・請求アプリ REFERENCE_TABLEの値を確認
    const koujiKanryouList = (record as any).KOUJIKANRYOU_LIST;
    console.log(`完了報告・請求アプリ (KOUJIKANRYOU_LIST):`);

    if (koujiKanryouList && koujiKanryouList.value) {
      console.log(`  タイプ: ${koujiKanryouList.type}`);
      console.log(`  値: ${JSON.stringify(koujiKanryouList.value, null, 2)}`);
    } else {
      console.log(`  （なし）`);
    }

    console.log('');
  }

  // REFERENCE_TABLEフィールドの詳細構造を確認
  console.log('=== REFERENCE_TABLEフィールドの構造 ===\n');
  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    Object.keys(record).forEach(key => {
      const field = (record as any)[key];
      if (field.type === 'REFERENCE_TABLE') {
        console.log(`フィールドコード: ${key}`);
        console.log(`タイプ: ${field.type}`);
        console.log(`値の型: ${typeof field.value}`);
        console.log(`値: ${JSON.stringify(field.value, null, 2).substring(0, 500)}...`);
        console.log('');
      }
    });
  }
}

checkReferenceTableValue().catch(console.error);
