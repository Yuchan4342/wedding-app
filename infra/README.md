# infra

このアプリが使っている AWS リソースの Terraform 定義です。
コードは **AWS コンソール上に既に存在するリソースの設定値を読み取って書き起こしたもの**で、
初回は新規作成ではなく `import` で既存リソースを Terraform の管理下に取り込みます。

## 管理対象

| ファイル | リソース |
| --- | --- |
| [hosting_s3.tf](hosting_s3.tf) | SPA を配信する S3 バケット（静的ウェブサイトホスティング、バージョニング、ライフサイクル、暗号化、Cloudflare の IP に限定した公開ポリシー） |
| [cognito.tf](cognito.tf) | User Pool、User Pool Client × 2、Identity Pool、ロールの割り当て |
| [dynamodb.tf](dynamodb.tf) | 出欠回答テーブル `WedatInvitationAnswers` |
| [api_gateway.tf](api_gateway.tf) | REST API、2 リソース、GET / POST / OPTIONS × 2、DynamoDB への AWS 統合、マッピングテンプレート、ステージ |
| [templates/](templates/) | API Gateway のマッピングテンプレート（VTL）。[templates/README.md](templates/README.md) 参照 |
| [iam.tf](iam.tf) | IAM ロール（**未管理**。理由と手順はファイル内のコメント参照） |
| [tfstate_s3.tf](tfstate_s3.tf) | Terraform 自身の state を置く S3 バケット（バージョニング、暗号化、パブリックアクセスブロック、`prevent_destroy`） |

管理対象外:

- **Cognito のユーザー** — ゲストのアカウントは Terraform では作らない（コンソールまたは CLI で発行する運用）
- **DNS・CDN** — Cloudflare 側の設定
- **IAM ロールのポリシー** — 現在の権限では読み取れない（[iam.tf](iam.tf) 参照）

## セットアップ

state は S3 に置いてあるので、新しいマシンで clone した場合は Git 管理外の設定ファイル
2 つを用意して `init` するだけで、既存の state に接続できます。

```bash
# Macの場合
brew tap hashicorp/tap
brew install hashicorp/tap/terraform  # 1.10 以上（S3 backend のネイティブロックを使う）

cd infra
cp terraform.tfvars{.sample,}   # 値を埋める
cp backend.hcl{.sample,}        # state バケット名を埋める

terraform init -backend-config=backend.hcl   # .terraform.lock.hcl はコミットする
terraform plan                               # No changes になるはず
```

`terraform.tfvars` / `backend.hcl` / `imports.tf` は AWS アカウント ID やプール ID を含むため
[.gitignore](.gitignore) 済みです。`*.sample` の側だけをコミットします。

### ゼロから構築する場合

既存リソースを import して取り込む場合の手順です。state バケットも無い状態から始めるため、
先にローカル state でバケットを作ってから S3 に移します。

```bash
cp terraform.tfvars{.sample,}
cp imports.tf{.sample,}          # 既存リソースの ID を埋める

# 1. versions.tf の backend "s3" ブロックをコメントアウトした状態で、ローカル state のまま取り込む
terraform init
terraform plan                   # 「N to import, M to add, 0 to destroy」を目指す（M は state バケット関連）
terraform apply

# 2. backend ブロックのコメントを外し、state を S3 に移す
cp backend.hcl{.sample,}
terraform init -backend-config=backend.hcl -migrate-state   # 確認に yes
terraform plan                   # No changes
rm terraform.tfstate terraform.tfstate.backup               # 平文の ID を含むので残さない
```

取り込みが終わったら `imports.tf` は削除して構いません（state に残ります）。

### 実行に必要な IAM 権限

Terraform を実行する IAM プリンシパルには、管理対象リソースの参照（`plan`）と
更新（`apply`）の両方が必要です。以下は最小権限を組むときの起点。
provider のバージョンによって参照するアクションが増減するため、
厳密な最小集合ではありません。`plan` / `apply` で `AccessDenied` が出たものを
足していく前提で使ってください。

| サービス | アクション |
| --- | --- |
| S3 | バケット本体と各サブリソース（website / versioning / lifecycle / encryption / ownershipControls / publicAccessBlock / policy / tagging）の `Get*` と `Put*`。`aws_s3_bucket` は refresh のたびに未使用の設定（CORS・レプリケーション・ロギングなど）まで読むため、`s3:Get*` をバケット単位で許可するのが実際的 |
| S3（state バケット） | backend が使う `s3:ListBucket`（バケット）と `s3:GetObject` / `PutObject` / `DeleteObject`（`wedding-app/terraform.tfstate` とロックファイル `wedding-app/terraform.tfstate.tflock`）。plan だけでもロックの作成・削除が走るので、読み取り専用では動かない |
| DynamoDB | `DescribeTable` / `DescribeTimeToLive` / `DescribeContinuousBackups` / `ListTagsOfResource` / `UpdateTable` / `TagResource` / `UntagResource` |
| Cognito User Pool | `DescribeUserPool` / `DescribeUserPoolClient` / `ListTagsForResource` / `UpdateUserPool` / `UpdateUserPoolClient` / `TagResource` |
| Cognito Identity Pool | `DescribeIdentityPool` / `GetIdentityPoolRoles` / `UpdateIdentityPool` / `SetIdentityPoolRoles` / `TagResource` |
| API Gateway | `/restapis/*` に対する `apigateway:GET` / `POST` / `PATCH` / `PUT` / `DELETE` |
| IAM | [iam.tf](iam.tf) を有効にする場合のみ、そこに挙げた `iam:*` の読み取り権限 |

つまずきやすい点:

- **タグ系のアクション** — `default_tags` を使うと全リソースで `TagResource` 相当が要る。
  コンソールで作ったリソースを運用していただけの権限では抜けていることが多い。
- **`iam:PassRole`** — 既存リソースを import して運用するだけなら不要だが、
  API Gateway の統合ロールや Identity Pool の authenticated ロールを
  **Terraform で新規に作成・付け替えする場合は必要**になる。

## 運用

```bash
terraform plan    # コンソールで変更されていないかの検出にも使える
terraform output -json frontend_configuration | jq   # configuration.local.js 用の値
```

`terraform output` の値は `../src/configuration.local.js` の `amplifyAuth` / `amplifyAPI`、
バケット名は `../.deployrc` の `DEPLOY_S3_BUCKET` に対応します。

### state について

state は [tfstate_s3.tf](tfstate_s3.tf) で作る S3 バケットに置いています
（[versions.tf](versions.tf) の `backend "s3"`）。

- **バケット名だけ `backend.hcl`（Git 管理外）に分けている** — backend ブロックは変数を
  参照できないため、公開したくない値は `-backend-config` で渡すしかない。
  `key` / `region` / `encrypt` / `use_lockfile` はコミットしてある
- **ロックは S3 ネイティブ（`use_lockfile = true`）** — 実行中は
  `terraform.tfstate.tflock` が置かれ、同時実行は `Error acquiring the state lock` で止まる。
  DynamoDB テーブルは使っていない
- **バケットは自分自身の state を保持している** — `terraform destroy` で自分の state ごと
  消さないよう `prevent_destroy` を付けている。バケットを消したい場合は先に
  backend をローカルに戻す
- **バージョニング有効** — 誤った apply の後は S3 のオブジェクトバージョンから
  前の state に戻せる

state には Cognito のプール ID などが平文で入ります。ローカルにコピーした場合も
リポジトリにはコミットしないでください（`*.tfstate*` は `.gitignore` 済み）。

## 初回 apply で出る想定内の差分

設定内容は同じでも、import した初回だけ差分として出るものがある。
いずれも適用すれば解消し、2 回目以降は `No changes` になる。

- **タグの追加** — コンソールで作ったリソースにはタグが無いため、`default_tags` の
  `Project` / `ManagedBy` が全リソースに付く。付けたくない場合は `tags` 変数を `{}` にする。
- **`aws_api_gateway_deployment` の作成と `aws_api_gateway_stage` の
  `deployment_id` 更新** — `triggers` は API から読み取れないため import せず、
  Terraform 側で新しいデプロイを作ってステージに紐づける。
  同じ構成の再デプロイなので実害はない。
- **`aws_s3_bucket_lifecycle_configuration` への `filter {}` 追加** —
  空フィルタ（全オブジェクト対象）の表現差。
- **OPTIONS の `integration_response` から空の `response_templates` が削除** —
  中身が無いテンプレート定義の削除で、CORS の挙動は変わらない。

**削除（destroy）が出た場合は想定外**なので、適用せず原因を確認すること。

逆に、以下は**既存リソースの値をそのまま写してある**ので差分が出ない。直したい場合は
適用による挙動の変化を確認してから変更する。

- POST の `integration_response` の `selection_pattern`（`4\\d{2}` とバックスラッシュが
  二重化されており、実際にはマッチしない）
- `method_response` のヘッダ宣言が `required = false`
- OPTIONS の `passthrough_behavior` がリソースごとに `WHEN_NO_MATCH` / `NEVER` と不揃い

## 検討事項（このコードでは現状維持している）

コード化にあたって既存の設定をそのまま写しているが、見直す価値のある点。

1. **ログイン済みゲスト同士では他人の回答を指定できる** — GET / POST は
   `AWS_IAM` 認可で保護済み（下記「API の認可」参照）だが、`userId` は
   リクエスト側が指定した値をそのまま使っている。IAM 認可で参照できるのは
   Identity Pool の identity id と User Pool の `sub` だけで、`userId` に
   使われている Cognito の username とは対応しないため、IAM ポリシーでは
   本人確認まで表現できない。塞ぐには Cognito オーソライザーに変え、
   マッピングテンプレートで `$context.authorizer.claims['cognito:username']`
   を使う（フロントで `Authorization` ヘッダを付ける変更も伴う）。
2. **CORS が `*`** — 配信元ドメインに絞れる（`cors_allow_origin` 変数）。
   ただし絞ると `localhost` から本番 API を叩く開発ができなくなる。
   IAM 認可が入った今、CORS は防御の主役ではない。
3. **DynamoDB がプロビジョンド 5/5** — 招待客数十人規模のアクセスなら
   `PAY_PER_REQUEST` の方が安く、キャパシティ管理も不要。
4. **`wedding_client2` が未使用** — フロントが参照しているのは `wedding_client` のみ。
   不要なら import せず削除してよい。
5. **Cloudflare の IP レンジがハードコード** — レンジは変わることがある。
   `cloudflare_ip_ranges` 変数で管理しているが、定期的な見直しか、
   Cloudflare Tunnel / OAC への移行を検討する。
6. **DynamoDB の削除保護・PITR が無効** — 回答データを残す方針なら有効化する。

## API の認可

`GET /invitation-answers/{userId}` と `POST /invitation-answers` は
`AWS_IAM` 認可で、署名のないリクエストは 403 で弾かれる。

- **フロントの署名** — Amplify の API カテゴリは `Authorization` ヘッダが
  無いとき `Auth.currentCredentials()`（Identity Pool の一時クレデンシャル）で
  SigV4 署名する（`aws-amplify/lib/API/RestClient.js`）。
  このとき **`configuration.local.js` の `amplifyAPI.endpoints[].region` が必須**。
  未指定だと署名スコープが `undefined` になり、403
  `Credential should be scoped to a valid region.` で弾かれる。
  認可が `NONE` の間は署名が検証されないため表面化しない落とし穴。
- **呼び出し許可** — Identity Pool の authenticated ロールに
  `execute-api:Invoke` のインラインポリシーを付けている（[iam.tf](iam.tf)）。
  未ログインは Identity Pool が `AllowUnauthenticatedIdentities = false` なので
  そもそもクレデンシャルを取得できない。
- **`OPTIONS` は `NONE` のまま** — プリフライトはブラウザが署名せずに投げるため。
  MOCK 統合で CORS ヘッダを返すだけで、データには触れない。
- **認可エラーでも CORS ヘッダを返す** — `DEFAULT_4XX` / `DEFAULT_5XX` の
  ゲートウェイレスポンスにヘッダを足してある。これが無いと、署名切れが
  ブラウザ上で「CORS エラー」にしか見えず原因を追えない。

### 適用後の確認

```bash
# 署名なし → 403 になるはず
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/prod/invitation-answers/dummy

# プリフライトは 200 のまま
curl -i -X OPTIONS -H "Origin: https://<site>" \
  -H "Access-Control-Request-Method: POST" \
  https://<api-id>.execute-api.<region>.amazonaws.com/prod/invitation-answers
```

ブラウザからは実際にゲストの ID でログインし、回答済み画面の表示（GET）と
回答送信（POST）が通ることを確認する。
