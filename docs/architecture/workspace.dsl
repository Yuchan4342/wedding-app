// Wedding App の C4 モデル定義（Structurizr DSL）。
// このファイルが図の正で、Mermaid は export.sh で生成する。
// 編集したら export.sh を実行し、生成された .mmd と README.md の埋め込みも更新すること。
workspace "Wedding App" "結婚式の Web 招待状アプリケーションの C4 モデル" {

    model {
        guest = person "ゲスト（招待客）" "管理者から配布された ID でログインし、招待状を閲覧して出欠を回答する"
        admin = person "管理者（新郎新婦）" "ゲストのアカウントを発行し、回答を確認し、アプリをデプロイする"

        weddingApp = softwareSystem "Wedding App" "結婚式の Web 招待状。招待状の表示・カウントダウン・出欠回答フォームを提供する（SPA + API Gateway + DynamoDB）"

        cognito = softwareSystem "Amazon Cognito" "User Pool / Identity Pool。ゲストの認証と、API 呼び出しに使う一時クレデンシャルの発行" "External"
        googleMaps = softwareSystem "Google Maps Embed API" "会場の地図を iframe で埋め込む" "External"
        googleCalendar = softwareSystem "Google カレンダー" "「カレンダーに追加」リンクの遷移先" "External"
        venueSite = softwareSystem "式場のゲスト向けサイト" "式場が用意するご列席者様専用サイトと食物アレルギー登録フォーム（URL を設定した場合のみ案内）" "External"

        guest -> weddingApp "招待状を閲覧し、出欠を回答する" "HTTPS"
        admin -> weddingApp "ビルド・デプロイし、回答を確認する" "bin/deploy, AWS コンソール"
        admin -> cognito "ゲストごとのアカウントを発行する" "AWS コンソール / CLI"

        weddingApp -> cognito "ログイン認証と一時クレデンシャルの取得" "Amplify Auth"
        weddingApp -> googleMaps "会場の地図を表示する" "iframe"
        weddingApp -> googleCalendar "予定追加リンクへ遷移する" "外部リンク"
        weddingApp -> venueSite "専用サイト・アレルギー登録フォームへ案内する" "外部リンク"
    }

    views {
        systemContext weddingApp "SystemContext" "Wedding App と利用者・外部システムの関係" {
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
            element "External" {
                background #999999
                color #ffffff
            }
        }
    }
}
