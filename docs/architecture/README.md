# architecture

Wedding App の構成を [C4 モデル](https://c4model.com/) で図示したものです。
現在は最上位の **System Context 図**（システムと利用者・外部システムの関係）だけを用意しています。
Container 図（SPA / API Gateway / DynamoDB の内訳）以下は必要になった時点で `workspace.dsl` に追記します。

| ファイル | 役割 |
| --- | --- |
| [workspace.dsl](workspace.dsl) | Structurizr DSL。**図の正**はこのファイルで、要素・関係・見た目はここで編集する |
| [structurizr-SystemContext.mmd](structurizr-SystemContext.mmd) | `workspace.dsl` から生成した Mermaid。手で編集しない |
| [export.sh](export.sh) | Docker で `workspace.dsl` を検証し、Mermaid を再生成するスクリプト |

## System Context 図

```mermaid
graph LR
  linkStyle default fill:#ffffff

  subgraph diagram ["System Context View: Wedding App"]
    style diagram fill:#ffffff,stroke:#ffffff

    1["<div style='font-weight: bold'>ゲスト（招待客）</div><div style='font-size: 70%; margin-top: 0px'>[Person]</div><div style='font-size: 80%; margin-top:10px'>管理者から配布された ID<br />でログインし、招待状を閲覧して出欠を回答する</div>"]
    style 1 fill:#08427b,stroke:#052e56,color:#ffffff
    2["<div style='font-weight: bold'>管理者（新郎新婦）</div><div style='font-size: 70%; margin-top: 0px'>[Person]</div><div style='font-size: 80%; margin-top:10px'>ゲストのアカウントを発行し、回答を確認し、アプリをデプロイする</div>"]
    style 2 fill:#08427b,stroke:#052e56,color:#ffffff
    3["<div style='font-weight: bold'>Wedding App</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div><div style='font-size: 80%; margin-top:10px'>結婚式の Web<br />招待状。招待状の表示・カウントダウン・出欠回答フォームを提供する（SPA<br />+ API Gateway + DynamoDB）</div>"]
    style 3 fill:#1168bd,stroke:#0b4884,color:#ffffff
    4["<div style='font-weight: bold'>Amazon Cognito</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div><div style='font-size: 80%; margin-top:10px'>User Pool / Identity<br />Pool。ゲストの認証と、API<br />呼び出しに使う一時クレデンシャルの発行</div>"]
    style 4 fill:#999999,stroke:#6b6b6b,color:#ffffff
    5["<div style='font-weight: bold'>Google Maps Embed API</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div><div style='font-size: 80%; margin-top:10px'>会場の地図を iframe で埋め込む</div>"]
    style 5 fill:#999999,stroke:#6b6b6b,color:#ffffff
    6["<div style='font-weight: bold'>Google カレンダー</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div><div style='font-size: 80%; margin-top:10px'>「カレンダーに追加」リンクの遷移先</div>"]
    style 6 fill:#999999,stroke:#6b6b6b,color:#ffffff
    7["<div style='font-weight: bold'>式場のゲスト向けサイト</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div><div style='font-size: 80%; margin-top:10px'>式場が用意するご列席者様専用サイトと食物アレルギー登録フォーム（URL<br />を設定した場合のみ案内）</div>"]
    style 7 fill:#999999,stroke:#6b6b6b,color:#ffffff

    2-. "<div>ゲストごとのアカウントを発行する</div><div style='font-size: 70%'>[AWS コンソール / CLI]</div>" .->4
    3-. "<div>ログイン認証と一時クレデンシャルの取得</div><div style='font-size: 70%'>[Amplify Auth]</div>" .->4
    3-. "<div>会場の地図を表示する</div><div style='font-size: 70%'>[iframe]</div>" .->5
    3-. "<div>予定追加リンクへ遷移する</div><div style='font-size: 70%'>[外部リンク]</div>" .->6
    3-. "<div>専用サイト・アレルギー登録フォームへ案内する</div><div style='font-size: 70%'>[外部リンク]</div>" .->7
    1-. "<div>招待状を閲覧し、出欠を回答する</div><div style='font-size: 70%'>[HTTPS]</div>" .->3
    2-. "<div>ビルド・デプロイし、回答を確認する</div><div style='font-size: 70%'>[bin/deploy, AWS コンソール]</div>" .->3

  end
```

### 読み方

- **ゲスト（招待客）** — 管理者が配布した ID でログインし、招待状の閲覧と出欠回答をする
- **管理者（新郎新婦）** — Cognito にゲストのアカウントを発行し、`bin/deploy` でアプリを配信し、回答を AWS コンソール（DynamoDB）で確認する
- **Wedding App** — このリポジトリ。SPA（S3 + Cloudflare）、API Gateway、DynamoDB をまとめて 1 つのシステムとして扱う。内訳は Container 図の粒度なのでここでは描かない
- **Amazon Cognito** — 認証基盤。アプリの一部ではなく利用する外部サービスとして描いている
- **Google Maps Embed API / Google カレンダー / 式場のゲスト向けサイト** — 招待状から埋め込み・リンクで参照する外部サービス。式場サイトは `guestSiteUrl` / `allergyFormUrl` を設定した場合だけ案内が出る

## 図の更新手順

`workspace.dsl` を編集したら、Mermaid を再生成して **この README の `mermaid` ブロックも差し替え**、まとめてコミットします。

```bash
docs/architecture/export.sh   # Docker が必要。validate → export の順に実行する
```

- Docker イメージは [structurizr/structurizr](https://hub.docker.com/r/structurizr/structurizr) を使う。旧 `structurizr/cli` は非推奨化され、バナーを出すだけで動かない
- 出力ファイル名は `structurizr-<ビューのキー>.mmd`。ビューを増やしたらファイルも増える
- Mermaid の出力は `graph`（flowchart）形式で、Mermaid 独自の `C4Context` 記法ではない。GitHub と VS Code の Markdown プレビューでそのまま描画できる

Structurizr の公式ツールでも `workspace.dsl` をそのまま開けます。

```bash
# ブラウザで http://localhost:8080 を開くと、レイアウトを調整しながら図を確認できる
docker run --rm -p 8080:8080 -v "$(pwd)/docs/architecture:/usr/local/structurizr" structurizr/structurizr local
```
