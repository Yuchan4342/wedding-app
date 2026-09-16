# templates

API Gateway の**マッピングテンプレート**（Velocity Template Language / VTL）です。

## 何をしているファイルか

この API は Lambda を挟まず、API Gateway から DynamoDB を直接呼ぶ AWS 統合です。
そのため「HTTP リクエストを DynamoDB の API 呼び出しに変換する」「DynamoDB の
応答をフロントに返す JSON に変換する」処理を、テンプレートとして書く必要があります。
**Lambda を使う構成でいう関数のコードに相当する、この API で唯一のロジック**です。

| ファイル | 対応するメソッド | 役割 |
| --- | --- | --- |
| [put_item_request.vtl](put_item_request.vtl) | `POST /invitation-answers` | リクエストボディを DynamoDB `PutItem` の引数に変換する。同伴者が 1 人以上のときだけ `additionalAttendees` を文字列セットで入れ、未入力の任意項目（`address2` / `message` / `note`）は属性ごと省く |
| [get_item_request.vtl](get_item_request.vtl) | `GET /invitation-answers/{userId}` | パスパラメータをキーにして `GetItem` を呼ぶ |
| [get_item_response.vtl](get_item_response.vtl) | 同上のレスポンス | `GetItem` の結果から `userId` と `attendance` だけを返す。未回答なら空オブジェクト `{}` を返し、フロントはこれで未回答と判断する |

`${table_name}` は Terraform の `templatefile()` が埋める唯一のプレースホルダです。
VTL 側の `$inputRoot` や `$item` は `${...}` の形ではないので、そのまま通ります。

## なぜ `.tf` に直接書かず、別ファイルで管理するのか

- **実質的にアプリケーションロジックだから** — 回答のどの項目がどう保存されるかは
  このファイルが決めている。レビューと差分の対象にする価値がある。VTL のまま置けば
  エディタの支援も効き、変更点が読める。
- **HCL に埋め込むと壊れやすいから** — VTL は `$` を多用し、HCL の `${...}` 補間と
  衝突する。ヒアドキュメントに押し込むとエスケープが増えて読めなくなる。
  `templatefile()` で切り出せば VTL をそのまま書ける。
- **コンソールでの手編集を正にしないため** — ここが唯一の正であれば、
  コンソールで直接いじられた場合も `terraform plan` が差分として教えてくれる。

## 既知の課題

`put_item_request.vtl` は値をクォートで囲って JSON を組み立てているだけなので、
改行・引用符・波括弧を含む入力が来ると JSON が壊れます。現状はフロント側で
送信前に除去して回避しています（`removeJSONInvalidChars`。
[../../src/features/Invitation/Invitation.js](../../src/features/Invitation/Invitation.js)）。
本来はテンプレート側で `$util.escapeJavaScript()` などを使って
エスケープするのが筋です。
