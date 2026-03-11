import axios from 'axios';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'genki-denki.cybozu.com';
const KINTONE_KOJIIRAI_APP_ID = "655";
const KINTONE_KOJIIRAI_API_TOKEN = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function getFormFields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/app/form/fields.json`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Cybozu-API-Token': KINTONE_KOJIIRAI_API_TOKEN,
      },
      params: {
        app: KINTONE_KOJIIRAI_APP_ID,
      },
    });

    const properties = response.data.properties;

    console.log('=== 655アプリ（工事依頼・完了報告・請求）全フィールド一覧 ===\n');

    // FILEタイプのフィールドを探す
    console.log('### FILEタイプのフィールド:\n');
    for (const [fieldCode, field] of Object.entries(properties)) {
      if ((field as any).type === 'FILE') {
        const label = (field as any).label || fieldCode;
        console.log(`${label} (フィールドコード: ${fieldCode})`);

        // サンプル値があれば表示
        if ((field as any).defaultValue && (field as any).defaultValue.length > 0) {
          console.log(`  デフォルト値: ${(field as any).defaultValue.map((f: any) => f.name).join(', ')}`);
        } else {
          console.log(`  （ファイルなし）`);
        }
        console.log('');
      }
    }

    // 「見積添付」または類似の名前のフィールドを探す
    console.log('### 「見積添付」に関連するフィールド:\n');
    for (const [fieldCode, field] of Object.entries(properties)) {
      const label = (field as any).label || fieldCode;
      if (
        label.includes('見積') ||
        label.includes('添付') ||
        fieldCode.includes('MITSUMORI') ||
        fieldCode.includes('TEMPU') ||
        fieldCode.includes('mitsumori') ||
        fieldCode.toLowerCase().includes('tempu')
      ) {
        console.log(`${label} (フィールドコード: ${fieldCode}, タイプ: ${(field as any).type})`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

getFormFields();
