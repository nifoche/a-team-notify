import { WebClient } from '@slack/web-api';
import type { QueryResult } from './kintone.js';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID!;

if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
  throw new Error('Missing Slack environment variables');
}

const client = new WebClient(SLACK_BOT_TOKEN);

export async function sendToSlack(
  query1Result: QueryResult,
  query2Result: QueryResult
): Promise<void> {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 Aチーム業務用機器 担当サポート状況',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*クエリ1: 業務用LP/修理（6ヶ月以内、xlsx）*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*件数:*\n${query1Result.count}件`,
        },
        {
          type: 'mrkdwn',
          text: `*現場:*\n${query1Result.locationNames.join(', ') || 'なし'}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*クエリ2: 特定現場の特定種別（xlsx）*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*件数:*\n${query2Result.count}件`,
        },
        {
          type: 'mrkdwn',
          text: `*現場:*\n${query2Result.locationNames.join(', ') || 'なし'}`,
        },
      ],
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
    text: 'Aチーム業務用機器 担当サポート状況',
  });

  console.log('✅ Slack通知を送信しました');
}
