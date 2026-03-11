import axios from 'axios';
import type { QueryResult } from './kintone.js';

const LINEWORKS_WEBHOOK_URL = process.env.LINEWORKS_WEBHOOK_URL!;

if (!LINEWORKS_WEBHOOK_URL) {
  throw new Error('LINEWORKS_WEBHOOK_URL not configured');
}

// Webhookを使用してメッセージを送信
export async function sendToLINEWORKSWebhook(
  query1Result: QueryResult,
  query2Result: QueryResult
): Promise<void> {
  // locationNamesから工番と現場名を抽出
  const parseLocationName = (name: string) => {
    const match = name.match(/^(.+?) \[(.+?)\]\(\d+\)$/);
    if (match) {
      return { genbacode: match[2], genbamei: match[1] };
    }
    return { genbacode: '', genbamei: name };
  };

  const query1List = query1Result.locationNames.map(parseLocationName);
  const query2List = query2Result.locationNames.map(parseLocationName);

  // セクション1: 業務用案件
  let text = `📊 A-team対応案件リスト

✅業務用案件
条件：完了報告に見積添付があり見積提出が終わっていないもの
件数：${query1Result.count}件
現場:
`;
  query1List.forEach(({ genbacode, genbamei }) => {
    text += `${genbacode} ${genbamei}\n`;
  });

  // セクション2: 管理会社様案件
  text += `
🛜管理会社様案件
条件：完了報告に見積添付があり見積提出が終わっていないもの
件数：${query2Result.count}件
現場:
`;
  query2List.forEach(({ genbacode, genbamei }) => {
    text += `${genbacode} ${genbamei}\n`;
  });

  // LINE WORKS Webhookに送信（JSON body形式）
  await axios.post(LINEWORKS_WEBHOOK_URL!, {
    body: {
      text,
    },
  });

  console.log('✅ LINE WORKS通知を送信しました');
}
