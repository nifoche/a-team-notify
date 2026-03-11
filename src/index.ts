import { getQuery1Result, getQuery2Result } from './kintone.js';
import { sendToSlack } from './slack.js';
import { sendToLINEWORKSUser, sendToLINEWORKS } from './lineworks.js';

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

    // Slackに通知
    console.log('📤 Slackに通知中...');
    await sendToSlack(query1Result, query2Result);

    // LINE WORKSに通知
    console.log('📤 LINE WORKSに通知中...');
    // 特定のユーザーに送信する場合
    const targetUserId = process.env.LINEWORKS_TARGET_USER_ID;
    if (targetUserId) {
      await sendToLINEWORKSUser(targetUserId, query1Result, query2Result);
    } else {
      // ルームに送信する場合は roomId を設定する必要があります
      await sendToLINEWORKS(query1Result, query2Result);
    }

    console.log('🎉 すべての通知処理が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
