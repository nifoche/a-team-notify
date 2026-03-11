import axios from 'axios';
import crypto from 'crypto';
import type { QueryResult } from './kintone.js';

const LINEWORKS_API_ID = process.env.LINEWORKS_API_ID;
const LINEWORKS_SERVER_API_ID = process.env.LINEWORKS_SERVER_API_ID;
const LINEWORKS_SERVER_API_KEY = process.env.LINEWORKS_SERVER_API_KEY;
const LINEWORKS_BOT_ID = process.env.LINEWORKS_BOT_ID;

if (!LINEWORKS_API_ID || !LINEWORKS_SERVER_API_ID || !LINEWORKS_SERVER_API_KEY || !LINEWORKS_BOT_ID) {
  throw new Error('Missing LINE WORKS environment variables');
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// アクセストークンを取得
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const url = `https://auth.worksmobile.com/b/${LINEWORKS_API_ID}/server/token`;

  const consumerKey = LINEWORKS_SERVER_API_ID;
  const consumerSecret = LINEWORKS_SERVER_API_KEY;
  const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
  });

  const response = await axios.post(url, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authString}`,
    },
  });

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // 1分前に更新

  return accessToken!;
}

// メッセージを送信
export async function sendToLINEWORKS(
  query1Result: QueryResult,
  query2Result: QueryResult
): Promise<void> {
  const token = await getAccessToken();

  const text = `📊 Aチーム業務用機器 担当サポート状況

━━━━━━━━━━━━━━
【クエリ1】業務用LP/修理（6ヶ月以内、xlsx）
━━━━━━━━━━━━━━
件数: ${query1Result.count}件
現場: ${query1Result.locationNames.join(', ') || 'なし'}

━━━━━━━━━━━━━━
【クエリ2】特定現場の特定種別（xlsx）
━━━━━━━━━━━━━━
件数: ${query2Result.count}件
現場: ${query2Result.locationNames.join(', ') || 'なし'}

更新日時: ${new Date().toLocaleString('ja-JP')}`;

  const url = `https://www.worksapis.com/v1.0/bots/${LINEWORKS_BOT_ID}/messages/internal`;

  // 注: 実際には送信先のroomIdを指定する必要があります
  // これは特定のルームIDが必要です
  await axios.post(
    url,
    {
      content: {
        type: 'text',
        text,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log('✅ LINE WORKS通知を送信しました');
}

// 特定のユーザーに送信する場合
export async function sendToLINEWORKSUser(
  userId: string,
  query1Result: QueryResult,
  query2Result: QueryResult
): Promise<void> {
  const token = await getAccessToken();

  const text = `📊 Aチーム業務用機器 担当サポート状況

【クエリ1】業務用LP/修理（6ヶ月以内、xlsx）
件数: ${query1Result.count}件
現場: ${query1Result.locationNames.join(', ') || 'なし'}

【クエリ2】特定現場の特定種別（xlsx）
件数: ${query2Result.count}件
現場: ${query2Result.locationNames.join(', ') || 'なし'}

更新日時: ${new Date().toLocaleString('ja-JP')}`;

  const url = `https://www.worksapis.com/v1.0/bots/${LINEWORKS_BOT_ID}/users/${userId}/messages`;

  await axios.post(
    url,
    {
      content: {
        type: 'text',
        text,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(`✅ LINE WORKS通知を送信しました (ユーザー: ${userId})`);
}
