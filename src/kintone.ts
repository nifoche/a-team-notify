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

// クエリ1: 業務用LP/修理の6ヶ月以内のデータ
const QUERY1 = `KOKYAKUMEI in ("業務用LP", "業務用修理") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS)`;

// クエリ2: 業務用LP/修理/販売王のデータ
const QUERY2 = `KOKYAKUMEI in ("業務用LP", "業務用修理", "業務用（販売王）") and UKETSUKEDATE >= FROM_TODAY(-6, MONTHS)`;

async function fetchRecords(query: string): Promise<QueryResult> {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  const params = new URLSearchParams({
    app: KINTONE_APP_ID,
    query: `${query} order by UKETSUKEDATE desc limit 100`,
  });

  console.log(`  クエリ: ${query}`);

  const response = await axios.get<KintoneQueryResult>(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_API_TOKEN,
    },
    params,
  });

  const records = response.data.records;

  // 現場名を集計（工事拠点フィールドは存在しない可能性があるため、顧客名を集計）
  const locationCount = new Map<string, number>();
  records.forEach((record) => {
    // まず工事拠点フィールドを試み、なければ顧客名を使用
    const location = (record as any).工事拠点?.value || record.KOKYAKUMEI?.value || '未設定';
    locationCount.set(location, (locationCount.get(location) || 0) + 1);
  });

  return {
    count: records.length,
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
