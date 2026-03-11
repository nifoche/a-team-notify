import axios from 'axios';

const KINTONE_DOMAIN = "genki-denki.cybozu.com";
const KINTONE_104_TOKEN = "DMTGHo59E568SPzlDg4keAdY5vMQBINtmPXsM7oc";
const KINTONE_655_TOKEN = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

async function verifySpecificRecords() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  const targetCodes = ['20251100050', '20250701468'];

  console.log('=== 特定工番の655アプリ添付ファイル確認 ===\n');

  for (const genbacode of targetCodes) {
    console.log(`\n工番: ${genbacode}`);
    console.log('─'.repeat(50));

    // 104アプリで工番検索
    const query104 = `GENBACODE = "${genbacode}" limit 5`;

    try {
      const response104 = await axios.get(url, {
        headers: { 'X-Cybozu-API-Token': KINTONE_104_TOKEN },
        params: { app: '104', query: query104 }
      });

      if (response104.data.records.length === 0) {
        console.log('  104アプリにレコードなし\n');
        continue;
      }

      const record104 = response104.data.records[0];
      const genbamei = (record104 as any).GENBAMEI?.value || '(なし)';
      const kokyakumei = (record104 as any).KOKYAKUMEI?.value || '(なし)';
      const status = (record104 as any).ステータス?.value || '(なし)';

      console.log(`  104アプリ:`);
      console.log(`    現場名: ${genbamei}`);
      console.log(`    顧客名: ${kokyakumei}`);
      console.log(`    ステータス: ${status}`);

      // 655アプリで現場名検索（現在の実装と同じ方法）
      const query655 = `GENBA_OKYAKUSAMAMEI = "${genbamei.replace(/"/g, '\\"')}" limit 10`;

      const response655 = await axios.get(url, {
        headers: { 'X-Cybozu-API-Token': KINTONE_655_TOKEN },
        params: { app: '655', query: query655 }
      });

      console.log(`\n  655アプリ検索結果: ${response655.data.records.length}件`);

      response655.data.records.forEach((record655: any) => {
        const id655 = record655.$id?.value;
        const code655 = record655.KANRIBANGOU?.value || '(なし)';
        const genba655 = record655.GENBA_OKYAKUSAMAMEI?.value || '(なし)';

        console.log(`    ID:${id655}, 管理番号:${code655}, 現場名:${genba655}`);

        // 「見積添付」ファイルを確認
        const mitsumoriTempu = record655['添付ファイル_0'];
        if (mitsumoriTempu?.value && mitsumoriTempu.value.length > 0) {
          const fileNames = mitsumoriTempu.value.map((f: any) => f.name);
          console.log(`      「見積添付」ファイル: ${fileNames.join(', ')}`);

          const hasXlsx = fileNames.some((name: string) => name.toLowerCase().includes('xlsx'));
          console.log(`      xlsx: ${hasXlsx ? 'あり' : 'なし'}`);
        } else {
          console.log(`      「見積添付」ファイル: （なし）`);
        }
      });

    } catch (error) {
      console.log(`  エラー: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}

verifySpecificRecords().catch(console.error);
