import axios from 'axios';

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_104_TOKEN = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function investigate104Form() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/app/form/fields.json`;

  console.log('=== 104アプリのフォーム詳細調査（REFERENCE_TABLE） ===\n');

  const response = await axios.get(url, {
    headers: { 'X-Cybozu-API-Token': KINTONE_104_TOKEN },
    params: { app: '104' }
  });

  const properties = response.data.properties;

  // REFERENCE_TABLEフィールドを探す
  console.log('### REFERENCE_TABLE（関連レコード一覧）フィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    if ((field as any).type === 'REFERENCE_TABLE') {
      const label = (field as any).label || fieldCode;
      const referenceTable = (field as any).referenceTable;

      console.log(`  フィールド名: ${label}`);
      console.log(`  フィールドコード: ${fieldCode}`);
      console.log(`  関連アプリ: ${referenceTable?.relatedApp?.app} (${referenceTable?.relatedApp?.name})`);
      console.log(`  条件フィールド: ${referenceTable?.condition?.relatedFieldLabel} (${referenceTable?.condition?.fieldLabel})`);
      console.log(`  表示フィールド: ${referenceTable?.fields?.map((f: any) => f.label).join(', ')}`);
      console.log('');
    }
  }

  // ルックアップフィールドも探す
  console.log('### ルックアップフィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    if ((field as any).type === 'SINGLE_LINE_TEXT') {
      const lookup = (field as any).lookup;
      if (lookup && lookup.relatedApp) {
        const label = (field as any).label || fieldCode;
        console.log(`  フィールド名: ${label}`);
        console.log(`  フィールドコード: ${fieldCode}`);
        console.log(`  コピー元アプリ: ${lookup.relatedApp.app} (${lookup.relatedApp.name})`);
        console.log(`  コピー元フィールド: ${lookup.relatedFieldLabel} (${lookup.relatedFieldCode})`);
        console.log('');
      }
    }
  }

  // 655アプリに関連しそうなフィールド
  console.log('### 655アプリに関連しそうなフィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    const label = (field as any).label || fieldCode;
    const type = (field as any).type;

    if (
      label.includes('工事') ||
      label.includes('依頼') ||
      label.includes('見積') ||
      label.includes('完了') ||
      label.includes('請求') ||
      fieldCode.includes('KOJI') ||
      fieldCode.includes('IRAI') ||
      fieldCode.includes('MITSUMORI')
    ) {
      console.log(`  ${label} (コード: ${fieldCode}, タイプ: ${type})`);
    }
  }
}

investigate104Form().catch(console.error);
