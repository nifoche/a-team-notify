import axios from 'axios';

interface KintoneRecord {
  $id: { value: string };
  f181911: { value: string }; // 日付
  f5682302: { value: string }; // 現場名
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

// クエリ1: 業務用LP/修理/（販売王）の6ヶ月以内のxlsxファイル
const QUERY1 = `f181839 in ("5122159", "5679005") and f181946 = "5" and f5682949.f5967523 like "xlsx" and f181911 >= FROM_TODAY(-6, MONTHS)`;

// クエリ2: 特定の現場の特定種別
const QUERY2 = `f181839 in ("5122159", "5679005", "5122160") and f5123869 in ("業務用LP", "業務用修理", "業務用（販売王）") and f5682302 in ("大阪店", "名古屋店", "埼玉店") and f5682949.f5967523 like "xlsx"`;

async function fetchRecords(query: string): Promise<QueryResult> {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json`;

  const params = new URLSearchParams({
    app: KINTONE_APP_ID,
    query: `${query} order by f181911 desc`,
  });

  const response = await axios.get<KintoneQueryResult>(url, {
    headers: {
      'X-Cybozu-API-Token': KINTONE_API_TOKEN,
    },
    params,
  });

  const records = response.data.records;

  // 現場名を集計
  const locationCount = new Map<string, number>();
  records.forEach((record) => {
    const location = record.f5682302?.value || '未設定';
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
