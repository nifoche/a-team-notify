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

if (!KINTONE_DOMAIN || !KINTONE_APP_ID || !KINTONE_API_TOKEN) {
  throw new Error('Missing Kintone environment variables');
}

export interface QueryResult {
  count: number;
  locationNames: string[];
}

// クエリ1: 業務用LP/修理の6ヶ月以内、特定現場、対応中のデータ
const QUERY1 = `KOKYAKUMEI in ("業務用LP", "業務用修理") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス = "対応中"`;

// クエリ2: 業務用LP/修理/販売王の6ヶ月以内、特定現場、未着手・対応中のデータ
const QUERY2 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS) and KOUJIKYOTEN in ("大阪店", "名古屋店", "埼玉店") and ステータス in ("未着手", "対応中")`;

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

  // テーブル内のxlsx添付ファイルでフィルタ
  const filteredRecords = records.filter((record, index) => {
    // 全てのテーブルをチェック
    const tables = [
      { name: 'テーブル', data: (record as any).テーブル },
      { name: 'テーブル_0', data: (record as any).テーブル_0 },
      { name: 'テーブル_1', data: (record as any).テーブル_1 },
      { name: 'テーブル_2', data: (record as any).テーブル_2 },
      { name: 'テーブル_4', data: (record as any).テーブル_4 },
    ];

    let hasXlsx = false;

    for (const { name, data } of tables) {
      if (!data || !data.value) continue;

      for (let rowIndex = 0; rowIndex < data.value.length; rowIndex++) {
        const row = data.value[rowIndex];

        // 添付ファイル_0と添付ファイル_4をチェック
        const fileFields = [
          { name: '添付ファイル_0', data: row.value?.添付ファイル_0 },
          { name: '添付ファイル_4', data: row.value?.添付ファイル_4 },
        ];

        for (const { name: fname, data: files } of fileFields) {
          if (!files || !files.value || !Array.isArray(files.value)) continue;

          for (const file of files.value) {
            const fileName = file.name || '';
            if (fileName.toLowerCase().includes('xlsx')) {
              console.log(`    [Match] レコード${index}: ${name}[${rowIndex}].${fname} = ${fileName}`);
              hasXlsx = true;
            }
          }
        }
      }
    }

    return hasXlsx;
  });

  console.log(`  フィルタ前: ${records.length}件 → フィルタ後: ${filteredRecords.length}件（xlsx添付ファイルあり）`);

  // 現場名を集計（現場名フィールドを使用）
  const locationCount = new Map<string, number>();
  filteredRecords.forEach((record) => {
    // 現場名フィールドを使用（なければ工事拠点、なければ顧客名）
    const location = (record as any).GENBAMEI?.value || (record as any).KOUJIKYOTEN?.value || record.KOKYAKUMEI?.value || '未設定';
    locationCount.set(location, (locationCount.get(location) || 0) + 1);
  });

  return {
    count: filteredRecords.length,
    locationNames: Array.from(locationCount.entries()).map(
      ([name, count]) => `${name}(${count})`
    ),
  };
}

export async function getQuery1Result(): Promise<QueryResult> {
  return fetchRecords(QUERY1);
}

export async function getQuery2Result(): Promise<QueryResult> {
  return fetchRecords(QUERY2);
}
