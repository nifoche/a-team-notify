# A Team Notify

kintoneから取得したデータをSlackとLINE WORKSに通知するシステム。

## 機能

- kintoneの2つのクエリ結果（件数と現場名）を取得
- Slackに整形されたメッセージを送信
- LINE WORKSに通知を送信

## セットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/nifoche/a-team-notify.git
cd a-team-notify
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、各種設定値を入力してください。

```bash
cp .env.example .env
```

### 必要な設定値

#### Kintone
- `KINTONE_DOMAIN`: kintoneのドメイン (例: `genki-denki.cybozu.com`)
- `KINTONE_APP_ID`: アプリID (例: `104`)
- `KINTONE_API_TOKEN`: APIトークン

#### Slack
- `SLACK_BOT_TOKEN`: Slack Bot Token (例: `xoxb-...`)
- `SLACK_CHANNEL_ID`: 通知先のチャンネルID

#### LINE WORKS
- `LINEWORKS_API_ID`: LINE WORKSのAPI ID
- `LINEWORKS_SERVER_API_ID`: Server API ID
- `LINEWORKS_SERVER_API_KEY`: Server API Key
- `LINEWORKS_BOT_ID`: Bot ID
- `LINEWORKS_TARGET_USER_ID`: 通知先のユーザーID（オプション）

## クエリ内容

### クエリ1
業務用LP/修理で、6ヶ月以内かつxlsxファイルのデータ
```
f181839 in ("5122159", "5679005") and f181946 = "5" and f5682949.f5967523 like "xlsx" and f181911 >= FROM_TODAY(-6, MONTHS)
```

### クエリ2
特定現場（大阪店、名古屋店、埼玉店）の特定種別（業務用LP、業務用修理、業務用（販売王））でxlsxファイルのデータ
```
f181839 in ("5122159", "5679005", "5122160") and f5123869 in ("業務用LP", "業務用修理", "業務用（販売王）") and f5682302 in ("大阪店", "名古屋店", "埼玉店") and f5682949.f5967523 like "xlsx"
```

## 実行方法

### 開発モード
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### 本番実行
```bash
npm start
```

## 通知フォーマット

### Slack
```
📊 Aチーム業務用機器 担当サポート状況

【クエリ1】業務用LP/修理（6ヶ月以内、xlsx）
件数: X件
現場: 大阪店(X), 名古屋店(X)

【クエリ2】特定現場の特定種別（xlsx）
件数: Y件
現場: 埼玉店(Y)
```

## 定期実行の設定

cronやGitHub Actionsなどで定期実行するように設定してください。

### GitHub Actionsの例
`.github/workflows/notify.yml`:
```yaml
name: Daily Notification
on:
  schedule:
    - cron: '0 9 * * 1-5'  # 平日の9時に実行
  workflow_dispatch:        # 手動実行も可能

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm start
        env:
          KINTONE_DOMAIN: ${{ secrets.KINTONE_DOMAIN }}
          KINTONE_APP_ID: ${{ secrets.KINTONE_APP_ID }}
          KINTONE_API_TOKEN: ${{ secrets.KINTONE_API_TOKEN }}
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
          SLACK_CHANNEL_ID: ${{ secrets.SLACK_CHANNEL_ID }}
          LINEWORKS_API_ID: ${{ secrets.LINEWORKS_API_ID }}
          LINEWORKS_SERVER_API_ID: ${{ secrets.LINEWORKS_SERVER_API_ID }}
          LINEWORKS_SERVER_API_KEY: ${{ secrets.LINEWORKS_SERVER_API_KEY }}
          LINEWORKS_BOT_ID: ${{ secrets.LINEWORKS_BOT_ID }}
          LINEWORKS_TARGET_USER_ID: ${{ secrets.LINEWORKS_TARGET_USER_ID }}
```
