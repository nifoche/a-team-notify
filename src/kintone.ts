import axios from 'axios';

interface KintoneRecord {
  $id: { value: string };
  UKETSUKEDATE: { value: string }; // 受付日
  KOKYAKUMEI: { value: string }; // 顧客名
}

interface KintoneQueryResult {
  records: KintoneRecord[];
  totalCount?: string;
}

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN!;
const KINTONE_APP_ID = process.env.KINTONE_APP_ID!;
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN!;

// 655アプリ（工事依頼・完了報告・請求）
const KINTONE_KOJIIRAI_APP_ID = "655";
const KINTONE_KOJIIRAI_API_TOKEN = "QkkLngdFssXaOiPB1QzrcBSCng1SxsRQ0Pfkp4ZR";

if (!KINTONE_DOMAIN || !KINTONE_APP_ID || !KINTONE_API_TOKEN) {
  throw new Error('Missing Kintone environment variables');
}

export interface QueryResult {
  count: number;
  locationNames: string[];
}

// クエリ1: 業務用LP/修理/販売王、特定現場、未着手・対応中・施工中のデータ（期間条件なし）
const QUERY1 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス in ("未着手", "対応中", "施工中")`;

// クエリ2: 6ヶ月以内、特定現場、部門5、未着手・対応中・施工中のデータ（顧客名条件なし）
const QUERY2 = `UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and BUMON = "5" and ステータス in ("未着手", "対応中", "施工中")`;

async function fetchRecords(query: string): Promise<QueryResult> {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  const params = new URLSearchParams({
    app: KINTONE_APP_ID,
    query: `${query} order by UKETSUKEDATE desc limit 500`,
  });

  console.log(`  クエリ: ${query}`);

  const response = await axios.get<KintoneQueryResult>(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_API_TOKEN,
    },
    params,
  });

  const records = response.data.records;

  // 両方のクエリで655アプリのxlsxフィルタを適用（「見積添付」フィールドのみ）
  const isQuery1 = query.includes('KOKYAKUMEI in');
  const isQuery2 = query.includes('BUMON = "5"');

  let filteredRecords: typeof records;

  if (isQuery1 || isQuery2) {
    // 新アプローチ: 655アプリからxlsxがあるレコードを取得し、104アプリと照合
    const queryName = isQuery1 ? 'クエリ1' : 'クエリ2';
    console.log(`  ${queryName}: 655アプリの「見積添付」xlsxファイルを確認中...`);

    // まず、104アプリのレコードの現場名をセットにする
    const genbameiSet = new Set<string>();
    records.forEach((record) => {
      const genbamei = (record as any).GENBAMEI?.value;
      if (genbamei) {
        genbameiSet.add(genbamei);
      }
    });

    // 655アプリから「見積添付」にxlsxがあるレコードを取得
    const filteredWithXlsx: typeof records = [];

    // 104アプリの各レコードについて、655アプリを検索
    for (const record104 of records) {
      const genbamei = (record104 as any).GENBAMEI?.value;
      const genbacode = (record104 as any).GENBACODE?.value;

      if (!genbamei || !genbacode) {
        continue;
      }

      // 655アプリで現場名と管理番号が完全一致するレコードを検索
      const query655 = `GENBA_OKYAKUSAMAMEI = "${genbamei.replace(/"/g, '\\"')}" and KANRIBANGOU = "${genbacode}" limit 100`;

      try {
        const response655 = await axios.get(url, {
          headers: {
            'X-Cybozu-API-Token': KINTONE_KOJIIRAI_API_TOKEN,
          },
          params: {
            app: KINTONE_KOJIIRAI_APP_ID,
            query: query655
          },
        });

        // 655アプリのレコードに「見積添付」xlsxファイルがあるか確認
        const hasXlsxIn655 = response655.data.records.some((record655: any) => {
          // 「見積添付」フィールド（フィールドコード: 添付ファイル_0）のみをチェック
          const field = record655['添付ファイル_0'];
          if (field && field.value && field.value.length > 0) {
            return field.value.some((file: any) => file.name.toLowerCase().includes('xlsx'));
          }
          return false;
        });

        if (hasXlsxIn655) {
          console.log(`    [Match] ${genbamei} [${genbacode}]: 「見積添付」xlsxファイルあり`);
          filteredWithXlsx.push(record104);
        }
      } catch (error) {
        // エラーは無視（655アプリに該当レコードなし）
      }
    }

    filteredRecords = filteredWithXlsx;
    console.log(`  ${queryName} フィルタ結果: ${records.length}件 → ${filteredRecords.length}件（「見積添付」xlsxファイルあり）`);
  } else {
    // 予期しないクエリ: フィルタなし
    filteredRecords = records;
    console.log(`  フィルタ: ${records.length}件（xlsxフィルタなし）`);
  }

  // 現場名と工番を集計
  const locationCount = new Map<string, number>();
  filteredRecords.forEach((record) => {
    const genbamei = (record as any).GENBAMEI?.value || '未設定';
    const genbacode = (record as any).GENBACODE?.value || '（工番なし）';

    // 「現場名: 工番」の形式で集計
    const key = `${genbamei}:${genbacode}`;
    locationCount.set(key, (locationCount.get(key) || 0) + 1);
  });

  return {
    count: filteredRecords.length,
    locationNames: Array.from(locationCount.entries()).map(
      ([key, count]) => {
        const [genbamei, genbacode] = key.split(':');
        return `${genbamei} [${genbacode}](${count})`;
      }
    ),
  };
}

export async function getQuery1Result(): Promise<QueryResult> {
  return fetchRecords(QUERY1);
}

export async function getQuery2Result(): Promise<QueryResult> {
  return fetchRecords(QUERY2);
}
