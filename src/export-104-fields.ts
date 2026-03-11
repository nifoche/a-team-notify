import axios from "axios";
import fs from 'fs';

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_APP_ID_104 = "104";
const KINTONE_API_TOKEN_104 = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";

async function export104Fields() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  // 104アプリの1件を取得
  const query = `limit 1`;

  const response = await axios.get(url, {
    headers: { "X-Cybozu-API-Token": KINTONE_API_TOKEN_104 },
    params: { app: KINTONE_APP_ID_104, query }
  });

  if (response.data.records.length > 0) {
    const record = response.data.records[0];

    let output = '=== 104アプリ（現場管理）全フィールド一覧 ===\n\n';

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

    // タイプ順に表示
    const typeOrder = [
      'FILE', 'CHECK_BOX', 'DROP_DOWN', 'RADIO_BUTTON', 'MULTI_SELECT',
      'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'NUMBER', 'CALC',
      'DATE', 'DATETIME', 'TIME', 'LINK',
      'USER_SELECT', 'STATUS_ASSIGNEE', 'GROUP_SELECT',
      'SUBTABLE', 'STATUS', 'RECORD_NUMBER',
      'CREATED_TIME', 'UPDATED_TIME', 'CREATOR', 'MODIFIER',
      '__ID__', '__REVISION__'
    ];

    typeOrder.forEach(type => {
      if (fieldTypes.has(type)) {
        output += `### ${type}\n\n`;
        const fields = fieldTypes.get(type)!;
        fields.forEach(({ key, field }) => {
          output += `${key}\n`;

          if (type === 'FILE') {
            const files = field.value || [];
            if (files.length > 0) {
              files.forEach((file: any) => {
                output += `  - ${file.name}\n`;
              });
            } else {
              output += `  （ファイルなし）\n`;
            }
          } else if (type === 'CHECK_BOX' || type === 'MULTI_SELECT') {
            const values = field.value || [];
            if (values.length > 0) {
              output += `  ${values.join(', ')}\n`;
            } else {
              output += `  （選択なし）\n`;
            }
          } else if (type === 'USER_SELECT' || type === 'STATUS_ASSIGNEE') {
            const users = field.value || [];
            if (users.length > 0) {
              users.forEach((user: any) => {
                output += `  - ${user.name}\n`;
              });
            } else {
              output += `  （ユーザーなし）\n`;
            }
          } else if (type === 'CREATOR' || type === 'MODIFIER') {
            const user = field.value;
            if (user) {
              output += `  ${user.name}\n`;
            }
          } else if (type === 'SUBTABLE') {
            output += `  （サブテーブル）\n`;
          } else if (field.value && field.value.toString() !== 'なし' && field.value !== '') {
            const value = field.value.toString().substring(0, 100);
            output += `  ${value}\n`;
          }
          output += '\n';
        });
      }
    });

    // ファイルに出力
    fs.writeFileSync('/Users/sales/dev/genki/a-team-notify/104-app-fields.txt', output, 'utf-8');
    console.log(output);
    console.log('\n=== ファイルに保存しました: /Users/sales/dev/genki/a-team-notify/104-app-fields.txt ===');
  }
}

export104Fields().catch(console.error);
