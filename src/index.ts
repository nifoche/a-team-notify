import 'dotenv/config';
import { getQuery1Result, getQuery2Result } from './kintone.js';
import { sendToSlack } from './slack.js';
import { sendToLINEWORKSWebhook } from './lineworks.js';

async function main() {
  try {
    console.log('🚀 通知処理を開始します...');

    // Kintoneからデータを取得
    console.log('📥 Kintoneからデータを取得中...');
    const [query1Result, query2Result] = await Promise.all([
      getQuery1Result(),
      getQuery2Result(),
    ]);

    console.log('✅ Kintoneデータ取得完了');
    console.log(`  クエリ1: ${query1Result.count}件 (${query1Result.locationNames.join(', ') || '現場なし'})`);
    console.log(`  クエリ2: ${query2Result.count}件 (${query2Result.locationNames.join(', ') || '現場なし'})`);

    // Slackに通知（設定されている場合のみ）
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    if (slackBotToken) {
      console.log('📤 Slackに通知中...');
      await sendToSlack(query1Result, query2Result);
    } else {
      console.log('⏭️  Slackはスキップします（トークン未設定）');
    }

    // LINE WORKSに通知
    console.log('📤 LINE WORKSに通知中...');
    await sendToLINEWORKSWebhook(query1Result, query2Result);

    console.log('🎉 すべての通知処理が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
