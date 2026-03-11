import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugExpectedRecords() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 期待される現場名で検索
  const query = `(GENBAMEI = "Felicidade（フェリシダージ）　107号室" or GENBAMEI = "コナミスポーツ渋谷　８F") limit 2`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコード ===\n`);

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  $id: ${record.$id?.value}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`  部門: ${record.BUMON?.value || 'なし'}`);
    console.log(`  工事拠点: ${record.KOUJIKYOTEN?.value || 'なし'}`);
    console.log(`  顧客名: ${record.KOKYAKUMEI?.value || 'なし'}`);
    console.log(`  受付日: ${record.UKETSUKEDATE?.value || 'なし'}`);

    // 特にテーブル_2に注目
    console.log('\n  テーブル_2の詳細:');
    const table2 = record.テーブル_2;
    if (table2 && table2.value && table2.value.length > 0) {
      table2.value.forEach((row: any, rowIndex: number) => {
        console.log(`    行${rowIndex}:`);
        Object.keys(row.value).forEach(key => {
          const field = row.value[key];
          const value = field.type === 'CHECK_BOX' ? field.value?.join(', ') :
                       field.type === 'FILE' ? `${field.value?.length || 0}ファイル` :
                       field.value?.toString() || '空';
          console.log(`      ${key} (${field.type}): ${value}`);
        });
      });
    }

    // テーブル（添付ファイル_0がある場所）
    console.log('\n  テーブル（添付ファイル）:');
    const table = record.テーブル;
    if (table && table.value && table.value.length > 0) {
      table.value.forEach((row: any, rowIndex: number) => {
        const files = row.value.添付ファイル_0;
        if (files && files.value && files.value.length > 0) {
          console.log(`    行${rowIndex}.添付ファイル_0:`);
          files.value.forEach((file: any) => {
            console.log(`      - ${file.name} (${file.contentType})`);
          });
        }
      });
    }

    console.log('\n---\n');
  });

  console.log('=== URLのフィルタ条件を確認 ===');
  console.log('クエリ2のURLから推測:');
  console.log('- f181839というフィールドコードがあるかもしれない');
  console.log('- 「完了報告・請求アプリ(見積添付)」というCHECK_BOXフィールドの可能性');
}

debugExpectedRecords().catch(console.error);
