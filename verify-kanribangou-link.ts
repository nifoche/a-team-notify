import axios from 'axios';

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_104_TOKEN = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";
const KINTONE_655_TOKEN = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function verifyKanriBangouLink() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  console.log('=== 104アプリと655アプリの管理番号紐付け検証 ===\n');

  // 104アプリからサンプルレコードを取得（QUERY1の条件）
  const query104 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス in ("未着手", "対応中", "施工中") limit 5`;

  console.log(`104アプリクエリ: ${query104}\n`);

  const response104 = await axios.get(url, {
    headers: { 'X-Cybozu-API-Token': KINTONE_104_TOKEN },
    params: { app: '104', query: query104 }
  });

  console.log(`104アプリから${response104.data.records.length}件取得\n`);

  for (const record104 of response104.data.records) {
    const kanriBangou = (record104 as any).KANRIBANGOU?.value;
    const genbamei = (record104 as any).GENBAMEI?.value;

    console.log(`管理番号: ${kanriBangou || '(なし)'}, 現場名: ${genbamei || '(なし)'}`);

    if (!kanriBangou) {
      console.log('  → 管理番号がないためスキップ\n');
      continue;
    }

    // 655アプリで同じ管理番号を検索
    const query655 = `KANRIBANGOU = "${kanriBangou}" limit 10`;

    try {
      const response655 = await axios.get(url, {
        headers: { 'X-Cybozu-API-Token': KINTONE_655_TOKEN },
        params: { app: '655', query: query655 }
      });

      console.log(`  655アプリ検索結果: ${response655.data.records.length}件`);

      if (response655.data.records.length > 0) {
        const record655 = response655.data.records[0];

        // 「見積添付」ファイルを確認
        const mitsumoriTempu = record655['添付ファイル_0'];
        const hasMitsumori = mitsumoriTempu?.value && mitsumoriTempu.value.length > 0;

        console.log(`  現場予定者名: ${(record655 as any).GENBA_OKYAKUSAMAMEI?.value || '(なし)'}`);
        console.log(`  「見積添付」ファイル: ${hasMitsumori ? 'あり' : 'なし'}`);

        if (hasMitsumori) {
          const fileNames = mitsumoriTempu.value.map((f: any) => f.name);
          console.log(`  ファイル名: ${fileNames.join(', ')}`);

          const hasXlsx = fileNames.some((name: string) => name.toLowerCase().includes('xlsx'));
          console.log(`  xlsxファイル: ${hasXlsx ? 'あり' : 'なし'}`);
        }
      } else {
        console.log('  → 655アプリに対応レコードなし');
      }
    } catch (error) {
      console.log(`  エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('');
  }
}

verifyKanriBangouLink().catch(console.error);
