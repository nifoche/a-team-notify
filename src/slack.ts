import { WebClient } from '@slack/web-api';
import type { QueryResult } from './kintone.js';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const client = SLACK_BOT_TOKEN && SLACK_CHANNEL_ID ? new WebClient(SLACK_BOT_TOKEN) : null;

export async function sendToSlack(
  query1Result: QueryResult,
  query2Result: QueryResult
): Promise<void> {
  if (!client || !SLACK_CHANNEL_ID) {
    console.log('⏭️  Slackはスキップします（トークン未設定）');
    return;
  }

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

  // テキストを作成（LINE WORKSと同じ形式）
  let text = `📊 A-team対応案件リスト\n\n` +
    `✅業務用案件\n` +
    `条件：完了報告に見積添付があり見積提出が終わっていないもの\n` +
    `件数：${query1Result.count}件\n` +
    `現場:\n`;

  query1List.forEach(({ genbacode, genbamei }) => {
    text += `${genbacode} ${genbamei}\n`;
  });

  text += `\n` +
    `🛜管理会社様案件\n` +
    `条件：完了報告に見積添付があり見積提出が終わっていないもの\n` +
    `件数：${query2Result.count}件\n` +
    `現場:\n`;

  query2List.forEach(({ genbacode, genbamei }) => {
    text += `${genbacode} ${genbamei}\n`;
  });

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 A-team対応案件リスト',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: text,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `更新日時: ${new Date().toLocaleString('ja-JP')}`,
        },
      ],
    },
  ];

  await client.chat.postMessage({
    channel: SLACK_CHANNEL_ID,
    blocks,
    text: '📊 A-team対応案件リスト',
  });

  console.log('✅ Slack通知を送信しました');
}
