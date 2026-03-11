import 'dotenv/config';
import axios from "axios";

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || "";
const KINTONE_APP_ID = process.env.KINTONE_APP_ID || "";
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || "";

async function debugAllTables() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // まず現場名で検索してみる
  const query = `GENBAMEI like "Felicidade" or GENBAMEI like "コナミスポーツ" limit 5`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN },
    params: { app: KINTONE_APP_ID, query }
  });

  console.log(`=== ${response.data.records.length}件のレコード ===\n`);

  response.data.records.forEach((record: any, i: number) => {
    console.log(`[レコード ${i + 1}] ${record.RECORDTITLE?.value || 'No title'}`);
    console.log(`  現場名: ${record.GENBAMEI?.value || 'なし'}`);
    console.log(`  ステータス: ${record.ステータス?.value || 'なし'}`);
    console.log(`  部門: ${record.BUMON?.value || 'なし'}`);
    console.log(`  工事拠点: ${record.KOUJIKYOTEN?.value || 'なし'}`);
    console.log(`  顧客名: ${record.KOKYAKUMEI?.value || 'なし'}`);

    // 全てのフィールドをチェック
    console.log('\n  全テーブル構造:');
    Object.keys(record).forEach(key => {
      const field = record[key];

      if (field && field.type === "SUBTABLE") {
        console.log(`    テーブル: ${key}`);
        if (field.value && field.value.length > 0) {
          const firstRow = field.value[0];
          console.log('      フィールド一覧:');
          Object.keys(firstRow.value).forEach(subKey => {
            const subField = firstRow.value[subKey];
            const value = subField.type === 'CHECK_BOX' ? subField.value?.join(', ') : subField.value;
            console.log(`        - ${subKey} (${subField.type}): ${value?.toString().substring(0, 50) || '空'}`);

            // 「完了報告」「請求」「見積」「xlsx」を含むものを特別表示
            if (subKey.includes('完了報告') || subKey.includes('請求') || subKey.includes('見積')) {
              const fullValue = subField.type === 'CHECK_BOX' ? subField.value : subField.value;
              console.log(`          ★詳細: ${JSON.stringify(fullValue)}`);
            }
          });
        }
      }
    });

    console.log('\n---\n');
  });
}

debugAllTables().catch(console.error);
