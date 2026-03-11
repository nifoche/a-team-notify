import axios from 'axios';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'genki-denki.cybozu.com';
const KINTONE_104_API_TOKEN = process.env.KINTONE_API_TOKEN || '';
const KINTONE_655_API_TOKEN = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function investigate104App() {
  console.log('\n=== 104アプリ（現場管理）調査 ===\n');

  // フォーム情報を取得
  const url = `https://${KINTONE_DOMAIN}/k/v1/app/form/fields.json`;
  const response = await axios.get(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_104_API_TOKEN,
    },
    params: {
      app: '104',
    },
  });

  const properties = response.data.properties;

  // FILEフィールドを表示
  console.log('### FILEタイプのフィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    if ((field as any).type === 'FILE') {
      const label = (field as any).label || fieldCode;
      console.log(`  ${label} (コード: ${fieldCode})`);
    }
  }

  // ルックアップフィールドを確認
  console.log('\n### ルックアップ関連フィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    if ((field as any).type === 'SINGLE_LINE_TEXT') {
      const label = (field as any).label || fieldCode;
      if (
        label.includes('工番') ||
        label.includes('工事') ||
        fieldCode.includes('KOJI') ||
        fieldCode.includes('KOUJI')
      ) {
        console.log(`  ${label} (コード: ${fieldCode})`);
      }
    }
  }
}

async function investigate655App() {
  console.log('\n=== 655アプリ（工事依頼・完了報告・請求）調査 ===\n');

  const url = `https://${KINTONE_DOMAIN}/k/v1/app/form/fields.json`;
  const response = await axios.get(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_655_API_TOKEN,
    },
    params: {
      app: '655',
    },
  });

  const properties = response.data.properties;

  // FILEフィールドを詳細表示
  console.log('### FILEタイプのフィールド（詳細）:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    if ((field as any).type === 'FILE') {
      const label = (field as any).label || fieldCode;
      console.log(`  フィールド名: ${label}`);
      console.log(`  フィールドコード: ${fieldCode}`);
      console.log(`  必須: ${(field as any).required || false}`);
      console.log('');
    }
  }

  // 104アプリとの関連フィールドを探す
  console.log('### 104アプリとの関連フィールド:\n');
  for (const [fieldCode, field] of Object.entries(properties)) {
    const label = (field as any).label || fieldCode;
    if (
      label.includes('現場') ||
      label.includes('工番') ||
      fieldCode.includes('GENBA') ||
      fieldCode.includes('KOJI')
    ) {
      console.log(`  ${label} (コード: ${fieldCode}, タイプ: ${(field as any).type})`);
    }
  }
}

async function checkSampleRecords() {
  console.log('\n=== 実際のレコードデータ確認 ===\n');

  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリからサンプルレコードを取得
  console.log('### 104アプリのサンプルレコード（最初の5件）:\n');
  const response104 = await axios.get(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_104_API_TOKEN,
    },
    params: {
      app: '104',
      query: 'ステータス in ("未着手", "対応中", "施工中") limit 5',
    },
  });

  for (const record of response104.data.records) {
    const genbamei = (record as any).GENBAMEI?.value || '(なし)';
    const genbacode = (record as any).GENBACODE?.value || '(なし)';
    console.log(`  現場名: ${genbamei}, 工番: ${genbacode}`);
  }

  // 655アプリからサンプルレコードを取得
  console.log('\n### 655アプリのサンプルレコード（最初の5件）:\n');
  const response655 = await axios.get(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_655_API_TOKEN,
    },
    params: {
      app: '655',
      query: 'order by $id desc limit 5',
    },
  });

  for (const record of response655.data.records) {
    const genbaName = (record as any).GENBA_OKYAKUSAMAMEI?.value || '(なし)';
    const id = (record as any).$id?.value || '(なし)';

    // 「見積添付」フィールド（添付ファイル_0）のファイル名を表示
    const mitsumoriTempu = (record as any)['添付ファイル_0'];
    const fileNames = mitsumoriTempu?.value?.map((f: any) => f.name) || [];

    console.log(`  ID: ${id}, 現場名: ${genbaName}`);
    if (fileNames.length > 0) {
      console.log(`    「見積添付」ファイル: ${fileNames.join(', ')}`);
    } else {
      console.log(`    「見積添付」ファイル: （なし）`);
    }
  }
}

async function main() {
  try {
    await investigate104App();
    await investigate655App();
    await checkSampleRecords();

    console.log('\n=== 調査完了 ===\n');

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

main();
