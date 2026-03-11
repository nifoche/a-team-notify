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
  const text = `📊 Aチーム業務用機器 担当サポート状況

━━━━━━━━━━━━━━
【クエリ1】業務用LP/修理（6ヶ月以内）
━━━━━━━━━━━━━━
件数: ${query1Result.count}件
現場: ${query1Result.locationNames.join(', ') || 'なし'}

━━━━━━━━━━━━━━
【クエリ2】特定現場の特定種別
━━━━━━━━━━━━━━
件数: ${query2Result.count}件
現場: ${query2Result.locationNames.join(', ') || 'なし'}

更新日時: ${new Date().toLocaleString('ja-JP')}`;

  // LINE WORKS Webhookに送信（textパラメータを使用）
  await axios.post(LINEWORKS_WEBHOOK_URL!, null, {
    params: { text },
  });

  console.log('✅ LINE WORKS通知を送信しました');
}
