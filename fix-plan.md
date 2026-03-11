# xlsxフィルタ修正プラン

## 問題
通知結果が正しくない。「見積添付場所が違う」

## 原因
104アプリと655アプリの紐付けが現場名の部分一致検索で不正確

## 解決策
管理番号（KANRIBANGOU）で完全一致検索に変更

## 実装手順

### 1. 104アプリのクエリ結果から管理番号を取得
```typescript
const kanriBangou = (record as any).KANRIBANGOU?.value;
```

### 2. 管理番号で655アプリを検索
```typescript
const query655 = `KANRIBANGOU = "${kanriBangou}" limit 100`;
```

### 3. 655アプリの「見積添付」フィールドをチェック
```typescript
const field = record655['添付ファイル_0'];
if (field && field.value && field.value.length > 0) {
  return field.value.some((file: any) => file.name.toLowerCase().includes('xlsx'));
}
```

## フィールド構造

### 104アプリ
- KANRIBANGOU: 管理番号（例: 20260300754）
- GENBAMEI: 現場名
- KOKYAKUMEI: 顧客名
- KOUJIKYOTEN: 工事拠点
- ステータス: ステータス

### 655アプリ
- KANRIBANGOU: 管理番号（例: 20260300754）
- GENBA_OKYAKUSAMAMEI: 現場予定者名
- 添付ファイル_0: 見積添付（FILEタイプ）

## 期待する動作
1. 104アプリから条件に合うレコードを取得
2. 各レコードの管理番号で655アプリを検索
3. 655アプリの対応するレコードの「見積添付」にxlsxファイルがあるか確認
4. xlsxがある場合のみ通知対象にする
