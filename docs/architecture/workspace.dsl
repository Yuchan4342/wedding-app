// Wedding App の C4 モデル定義（Structurizr DSL）。
// このファイルが図の正で、SVG は export.sh（Structurizr → PlantUML）で生成する。
// 編集したら export.sh を実行し、生成された .svg もあわせてコミットすること。
workspace "Wedding App" "結婚式の Web 招待状アプリケーションの C4 モデル" {

    model {
        guest = person "ゲスト（招待客）" "管理者から配布された ID でログインし、招待状を閲覧して出欠を回答する"
        admin = person "管理者（新郎新婦）" "ゲストのアカウントを発行し、回答を確認し、アプリをデプロイする"

        weddingApp = softwareSystem "Wedding App" "結婚式の Web 招待状。招待状の表示・カウントダウン・出欠回答フォームを提供する（SPA + API Gateway + DynamoDB）" {
            cdn = container "CDN" "配信元の S3 を隠し、HTTPS とキャッシュを担う。DNS も含めて Cloudflare 側の設定で、Terraform の管理対象外" "Cloudflare"
            spa = container "招待状 SPA" "招待状の表示、カウントダウン、出欠回答フォーム。ブラウザ上で動作し、式ごとの設定値は configuration.local.js から読む" "React 18 / Redux / AWS Amplify"

            // AWS 上のリソースはまとめて枠で囲む（infra/ の Terraform 管理対象）
            group "Amazon Web Services" {
                hosting = container "静的ホスティング" "ビルド成果物（HTML / JS / CSS / 画像）を置く。Cloudflare の IP レンジからの GetObject だけを許可する" "Amazon S3（静的ウェブサイトホスティング）"
                api = container "出欠回答 API" "GET /invitation-answers/{userId} と POST /invitation-answers。Lambda を介さず、VTL マッピングテンプレートで DynamoDB と直接統合する。IAM 認可" "Amazon API Gateway（REST API）"
                table = container "回答テーブル" "出欠回答を 1 ゲスト 1 アイテムで保存する（ハッシュキー userId）" "Amazon DynamoDB"
            }
        }

        cognito = softwareSystem "ID 管理（Amazon Cognito）" "ゲストのアカウント（ID とパスワード）を保持する。管理者が作成したユーザーだけがログインでき、サインアップは開放していない。User Pool でログインを、Identity Pool で API 呼び出し用の一時クレデンシャル発行を担う" "External"
        googleMaps = softwareSystem "Google Maps Embed API" "会場の地図を iframe で埋め込む" "External"
        googleCalendar = softwareSystem "Google カレンダー" "「カレンダーに追加」リンクの遷移先" "External"
        venueSite = softwareSystem "式場のゲスト向けサイト" "式場が用意するご列席者様専用サイトと食物アレルギー登録フォーム（URL を設定した場合のみ案内）" "External"

        // System Context レベルの関係
        guest -> weddingApp "招待状を閲覧し、出欠を回答する" "HTTPS"
        admin -> weddingApp "ビルド・デプロイし、回答を確認する" "bin/deploy, AWS コンソール"
        admin -> cognito "ゲストごとのアカウントを発行する" "AWS コンソール / CLI"

        weddingApp -> cognito "ログイン認証と一時クレデンシャルの取得" "Amplify Auth"
        weddingApp -> googleMaps "会場の地図を表示する" "iframe"
        weddingApp -> googleCalendar "予定追加リンクへ遷移する" "外部リンク"
        weddingApp -> venueSite "専用サイト・アレルギー登録フォームへ案内する" "外部リンク"

        // Container レベルの関係
        guest -> cdn "招待状の URL を開く" "HTTPS"
        guest -> spa "招待状を閲覧し、出欠を回答する" "Web ブラウザ"
        admin -> hosting "ビルド成果物を同期する" "bin/deploy（aws s3 sync）"
        admin -> table "回答を確認する" "AWS コンソール"

        cdn -> hosting "SPA のファイルを取得してキャッシュする" "HTTPS"
        cdn -> spa "SPA をブラウザへ配信する" "HTTPS"

        spa -> cognito "ログインと一時クレデンシャルの取得" "Amplify Auth / HTTPS"
        spa -> api "回答済みかを取得し、出欠回答を送信する" "JSON / HTTPS（SigV4 署名）"
        spa -> googleMaps "会場の地図を表示する" "iframe"
        spa -> googleCalendar "予定追加リンクへ遷移する" "外部リンク"
        spa -> venueSite "専用サイト・アレルギー登録フォームへ案内する" "外部リンク"

        api -> table "回答を読み書きする" "GetItem / PutItem（VTL マッピングテンプレート）"
    }

    views {
        // autoLayout には方向だけを渡す。引数でランク間隔・ノード間隔も指定できるが、
        // Mermaid のエクスポートでは方向しか使われない。

        systemContext weddingApp "SystemContext" "Wedding App と利用者・外部システムの関係" {
            include *
            autoLayout lr
        }

        container weddingApp "Containers" "Wedding App を構成するコンテナ" {
            include *
            autoLayout lr
        }

        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "External" {
                background #999999
                color #ffffff
            }
        }
    }
}
