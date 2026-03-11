import axios from 'axios';

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_655_TOKEN = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function investigate655Form() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/app/form/fields.json`;

  console.log('=== 655アプリのフォーム詳細調査 ===\n');

  const response = await axios.get(url, {
    headers: { 'X-Cybozu-API-Token': KINTONE_655_TOKEN },
    params: { app: '655' }
  });

  const properties = response.data.properties;

  // ルックアップフィールドを探す
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

  // 104アプリに関連しそうなフィールドを探す
  console.log('### 104アプリに関連しそうなフィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    const label = (field as any).label || fieldCode;
    const type = (field as any).type;

    // 現場名、工番、管理番号など
    if (
      label.includes('現場') ||
      label.includes('工番') ||
      label.includes('管理') ||
      label.includes('番号') ||
      fieldCode.includes('GENBA') ||
      fieldCode.includes('KOJI') ||
      fieldCode.includes('KANRI')
    ) {
      console.log(`  ${label} (コード: ${fieldCode}, タイプ: ${type})`);

      // 値の例があれば表示
      if ((field as any).defaultValue) {
        const defaultValue = (field as any).defaultValue;
        const valueStr = Array.isArray(defaultValue) ? defaultValue.join(', ') : defaultValue.toString().substring(0, 50);
        console.log(`    デフォルト値: ${valueStr}`);
      }
      console.log('');
    }
  }

  // 全フィールド一覧（フィールド名順）
  console.log('### 全フィールド一覧（フィールド名順）:\n');
  const fieldsSorted = Object.entries(properties)
    .map(([code, field]) => ({
      code,
      label: (field as any).label || code,
      type: (field as any).type,
      lookup: (field as any).lookup
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ja'));

  fieldsSorted.forEach(({ code, label, type, lookup }) => {
    const lookupInfo = lookup ? ` → アプリ${lookup.relatedApp.app}` : '';
    console.log(`  ${label} (${code}) [${type}]${lookupInfo}`);
  });
}

investigate655Form().catch(console.error);
