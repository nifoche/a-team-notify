import axios from "axios";

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function detailed104Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリの1件を取得
  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    console.log('=== 104アプリ（現場管理）全フィールド一覧 ===\n');

    // 全フィールドをアルファベット順に表示
    const sortedKeys = Object.keys(record).sort();

    sortedKeys.forEach(key => {
      const field = record[key];
      const type = field.type;

      console.log(`${key} [${type}]`);

      if (type === 'FILE') {
        const files = field.value || [];
        if (files.length > 0) {
          files.forEach((file: any) => {
            console.log(`  - ${file.name}`);
          });
        } else {
          console.log(`  （ファイルなし）`);
        }
      } else if (type === 'CHECK_BOX') {
        const values = field.value || [];
        if (values.length > 0) {
          console.log(`  ${values.join(', ')}`);
        } else {
          console.log(`  （選択なし）`);
        }
      } else if (type === 'SUBTABLE') {
        console.log(`  （サブテーブル）`);
      } else if (type === 'USER_SELECT') {
        const users = field.value || [];
        if (users.length > 0) {
          users.forEach((user: any) => {
            console.log(`  - ${user.name}`);
          });
        } else {
          console.log(`  （ユーザーなし）`);
        }
      } else if (type === 'CREATOR' || type === 'MODIFIER') {
        const user = field.value;
        if (user) {
          console.log(`  ${user.name}`);
        }
      } else if (field.value && field.value.toString() !== 'なし' && field.value !== '') {
        const value = field.value.toString().substring(0, 100);
        console.log(`  ${value}`);
      }

      console.log('');
    });
  }
}

detailed104Fields().catch(console.error);
