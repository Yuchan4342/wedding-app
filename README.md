# Wedding App

結婚式の Web 招待状アプリケーションです。招待客は式場から配布した ID でログインし、出欠・参列者・住所・メッセージを回答します。

2023 年 9 月から 12 月にかけて個人開発し、**2024 年に実際の結婚式で運用しました**。参列者からの回答受付、当日の案内表示まで一通りの役割を終えています。2026年に Claude を活用してソースコードを公開できるように修正の上、こちらで公開しています。

> [!NOTE]
> 公開にあたり、新郎新婦の氏名・写真・会場名・日時・式場が発行した URL はすべてサンプルの値に置き換えてあります。
> 実際に運用した際の設定値は `src/configuration.js`（Git 管理外）に置いていました。

## 主な機能

- **招待制のアクセス** — Amazon Cognito User Pool でゲストごとにアカウントを発行し、ログインしたユーザーだけが招待状を閲覧できる
- **招待状（ダッシュボード）** — カバー画像、招待文、日時・会場の案内、Google カレンダーへの追加リンク、Google Maps の埋め込み
- **カウントダウン** — 挙式前・開催中・終了後の 3 状態で表示を出し分ける
- **出欠回答フォーム** — 出欠、氏名、同伴者（可変長）、郵便番号、住所、メッセージ、備考を送信。都道府県名の実在チェックを含むバリデーション付き
- **回答済み状態の管理** — ログイン時に回答済みかを取得し、回答済みなら結果に応じた画面を表示する

## 技術スタック

| 領域 | 使用技術 |
| --- | --- |
| フレームワーク | React 18 / Create React App 5 |
| 状態管理 | Redux / Redux Toolkit / Redux Form |
| ルーティング | React Router v6 |
| スタイリング | styled-components / Tailwind CSS v3 |
| 認証・API 通信 | AWS Amplify (Auth / API) |
| 日付処理 | Luxon |
| ホスティング | Amazon S3 + CloudFront |

## アーキテクチャ

```text
ブラウザ
  │
  ├─ SPA（S3 + CloudFront で配信）
  │
  ├─ Amazon Cognito User Pool ────── ゲストごとのログイン
  │
  └─ Amazon API Gateway ─────────── GET  /invitation-answers/{userId}
                                     POST /invitation-answers
```

バックエンド（API Gateway・Lambda・データストア）の構築は AWS コンソール上で行っており、**その IaC はこのリポジトリには含まれていません**。このリポジトリはフロントエンドの SPA のみを対象としています。

## 実装のポイント

- **`withAuthenticator` の独自ラップ** — `aws-amplify-react` の `Authenticator` をラップし、認証状態を Redux に反映させたうえで、ログイン直後に回答済みかどうかを API から取得している（[src/components/Amplify/withAuthenticator.js](src/components/Amplify/withAuthenticator.js)）
- **設定値の一元化** — 氏名・会場・日時といった式ごとに変わる値をすべて `src/configuration.js` に集約し、コンポーネントにハードコードしない。式場が発行する URL は未設定なら案内ごと非表示になる
- **API Gateway のエスケープ対策** — マッピングテンプレート経由で JSON が壊れる問題への暫定対処として、送信前に改行・引用符・波括弧を除去している（`removeJSONInvalidChars`。[src/features/Invitation/Invitation.js](src/features/Invitation/Invitation.js)）
- **同伴者の可変長入力** — Redux Form の `FieldArray` で、同伴者を必要な人数だけ追加・削除できるようにしている

## セットアップ

```bash
cp src/configuration.js{.sample,}   # 設定ファイルを作成し、値を埋める
yarn install
yarn start
```

`src/configuration.js` には Cognito と API Gateway の情報が必要です。これらが未設定だとログイン画面から先に進めません。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `yarn start` | 開発サーバーを起動（<http://localhost:3000>） |
| `yarn build` | `build/` に本番ビルドを出力 |
| `yarn lint` | ESLint を実行 |
| `yarn build-tailwind` | `src/index.tailwind.css` から `src/index.css` を生成（start / build の前に自動実行される） |

## デプロイ

S3 の静的ウェブサイトホスティングへ同期するスクリプトを同梱しています。

```bash
cp .deployrc{.sample,}   # プロファイル名とバケット名を記入する（git 管理外）
bin/deploy               # .deployrc の設定でビルドとアップロードを実行
```

引数で直接指定することもできます。

```bash
bin/deploy <aws-profile> <s3-bucket>
```

ビルド後に `s3 sync --delete` で配信し、`index.html` / `manifest.json` / `service-worker.js` だけキャッシュを無効化します。CDN（CloudFront や Cloudflare）を挟んでいる場合は、別途キャッシュのパージが必要です。

## ディレクトリ構成

```text
src/
├── actions/            Redux のアクションクリエイター
├── reducers/           Redux のリデューサー
├── components/         アプリ全体で使う共通コンポーネント
│   └── Amplify/        Amplify の認証 UI をラップしたもの
├── features/
│   ├── Dashboard/      招待状の表示（カバー・招待文・案内・地図・カウントダウン）
│   └── Invitation/     出欠回答フォームと回答済み画面
├── configuration.js    式ごとの設定値（Git 管理外）
└── colors.js           Tailwind と共有するカラーパレット
```

## 既知の制約

- [デモアプリ](https://wedding.o-char.com)を公開していますが、**ログインが必須のため現状ログイン画面以外を閲覧できません。** 認証と API をモックに差し替えて未ログインでも閲覧できるデモモードを、今後追加する予定です。
- aws-amplify は当時の実装をそのまま残しており、バージョンが古いままです。
- 自動テストは整備していません。

## クレジット

カバー画像は [Unsplash](https://unsplash.com/) の写真を Unsplash License のもとで使用しています。詳細は [CREDITS.md](CREDITS.md) を参照してください。

プロジェクト <https://github.com/upinetree/wedat-demo> も参考に作成しています。

## ライセンス

[MIT License](LICENSE)
