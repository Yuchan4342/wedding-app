# 出欠回答用の REST API。Lambda を挟まず、マッピングテンプレートで
# DynamoDB の GetItem / PutItem を直接呼ぶ AWS 統合になっている。
#
#   GET  /invitation-answers/{userId}  回答済みかどうかの取得
#   POST /invitation-answers           出欠回答の保存
resource "aws_api_gateway_rest_api" "main" {
  name           = var.api_name
  description    = "結婚式招待状アプリ"
  api_key_source = "HEADER"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "invitation_answers" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "invitation-answers"
}

resource "aws_api_gateway_resource" "invitation_answer" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.invitation_answers.id
  path_part   = "{userId}"
}

locals {
  cors_origin_literal = "'${var.cors_allow_origin}'"

  cors_preflight_response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = local.cors_origin_literal
  }

  # method_response 側はヘッダの存在を宣言するだけ。既存の登録と同じく required=false
  cors_preflight_response_headers = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

# --- POST /invitation-answers（回答の保存） ---

# 認可は IAM。Amplify の API カテゴリは Authorization ヘッダが無いとき
# Auth.currentCredentials()（= Identity Pool の一時クレデンシャル）で
# SigV4 署名するため、ログイン済みゲストのリクエストだけが通る。
# 呼び出しを許可するポリシーは iam.tf を参照。
resource "aws_api_gateway_method" "post_invitation_answers" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.invitation_answers.id
  http_method      = "POST"
  authorization    = "AWS_IAM"
  api_key_required = false
}

resource "aws_api_gateway_integration" "post_invitation_answers" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.invitation_answers.id
  http_method = aws_api_gateway_method.post_invitation_answers.http_method

  type                    = "AWS"
  integration_http_method = "POST"
  uri                     = "arn:aws:apigateway:${var.aws_region}:dynamodb:action/PutItem"
  credentials             = var.api_integration_role_arn
  passthrough_behavior    = "WHEN_NO_TEMPLATES"
  timeout_milliseconds    = 29000

  request_templates = {
    "application/json" = templatefile(
      "${path.module}/templates/put_item_request.vtl",
      { table_name = aws_dynamodb_table.invitation_answers.name },
    )
  }
}

resource "aws_api_gateway_method_response" "post_invitation_answers" {
  for_each = toset(["200", "400", "500"])

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.invitation_answers.id
  http_method = aws_api_gateway_method.post_invitation_answers.http_method
  status_code = each.value

  # 既存の API ではヘッダの required が false で登録されている。値を入れるのは
  # integration_response 側なので、false のままでも CORS は機能する
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  # 200 だけがボディを返す
  response_models = each.value == "200" ? { "application/json" = "Empty" } : {}
}

resource "aws_api_gateway_integration_response" "post_invitation_answers" {
  for_each = {
    # selection_pattern が空文字のものが default（それ以外にマッチしなかった場合）。
    # 400 / 500 はコンソールで登録された際にバックスラッシュが二重化されており、
    # 実際には統合レスポンスにマッチしない（すべて default の 200 に落ちる）。
    # 既存の状態をそのまま保持しているので、直す場合は "4\\d{2}" に変えて
    # エラー時のレスポンスが変わることを確認してから適用する。
    "200" = ""
    "400" = "4\\\\d{2}"
    "500" = "5\\\\d{2}"
  }

  rest_api_id       = aws_api_gateway_rest_api.main.id
  resource_id       = aws_api_gateway_resource.invitation_answers.id
  http_method       = aws_api_gateway_method.post_invitation_answers.http_method
  status_code       = each.key
  selection_pattern = each.value

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = local.cors_origin_literal
  }

  depends_on = [aws_api_gateway_integration.post_invitation_answers]
}

# --- GET /invitation-answers/{userId}（回答済みかの取得） ---

resource "aws_api_gateway_method" "get_invitation_answer" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.invitation_answer.id
  http_method      = "GET"
  authorization    = "AWS_IAM"
  api_key_required = false

  request_parameters = {
    "method.request.path.userId" = true
  }
}

resource "aws_api_gateway_integration" "get_invitation_answer" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.invitation_answer.id
  http_method = aws_api_gateway_method.get_invitation_answer.http_method

  type                    = "AWS"
  integration_http_method = "POST"
  uri                     = "arn:aws:apigateway:${var.aws_region}:dynamodb:action/GetItem"
  credentials             = var.api_integration_role_arn
  passthrough_behavior    = "WHEN_NO_TEMPLATES"
  timeout_milliseconds    = 29000

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }

  request_templates = {
    "application/json" = templatefile(
      "${path.module}/templates/get_item_request.vtl",
      { table_name = aws_dynamodb_table.invitation_answers.name },
    )
  }
}

resource "aws_api_gateway_method_response" "get_invitation_answer" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.invitation_answer.id
  http_method = aws_api_gateway_method.get_invitation_answer.http_method
  status_code = "200"

  # 既存の API ではヘッダの required が false で登録されている。値を入れるのは
  # integration_response 側なので、false のままでも CORS は機能する
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "get_invitation_answer" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.invitation_answer.id
  http_method = aws_api_gateway_method.get_invitation_answer.http_method
  status_code = aws_api_gateway_method_response.get_invitation_answer.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = local.cors_origin_literal
  }

  # DynamoDB のレスポンスをフロントが見る userId / attendance だけに絞って返す
  response_templates = {
    "application/json" = file("${path.module}/templates/get_item_response.vtl")
  }

  depends_on = [aws_api_gateway_integration.get_invitation_answer]
}

# --- CORS プリフライト（MOCK 統合） ---

resource "aws_api_gateway_method" "options" {
  for_each = {
    invitation_answers = aws_api_gateway_resource.invitation_answers.id
    invitation_answer  = aws_api_gateway_resource.invitation_answer.id
  }

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = each.value
  http_method = "OPTIONS"

  # プリフライトはブラウザが署名なしで投げるため NONE のままにする必要がある。
  # MOCK 統合で CORS ヘッダを返すだけなので、データには触れない
  authorization    = "NONE"
  api_key_required = false

  # {userId} を含むパスではパスパラメータの宣言が必要
  request_parameters = each.key == "invitation_answer" ? {
    "method.request.path.userId" = true
  } : {}
}

resource "aws_api_gateway_integration" "options" {
  for_each = aws_api_gateway_method.options

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method

  type = "MOCK"

  # 既存の API では /invitation-answers 側が WHEN_NO_MATCH、{userId} 側が NEVER で
  # 登録されている（コンソールでの作成時期の違い）。差分を出さないため揃えない
  passthrough_behavior = each.key == "invitation_answer" ? "NEVER" : "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  for_each = aws_api_gateway_method.options

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  status_code = "200"

  response_parameters = local.cors_preflight_response_headers

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "options" {
  for_each = aws_api_gateway_method.options

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  status_code = "200"

  response_parameters = local.cors_preflight_response_parameters

  depends_on = [aws_api_gateway_integration.options]
}

# --- デプロイとステージ ---

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  # 構成が変わったときだけ再デプロイする
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.invitation_answers,
      aws_api_gateway_resource.invitation_answer,
      aws_api_gateway_method.post_invitation_answers,
      aws_api_gateway_integration.post_invitation_answers,
      aws_api_gateway_integration_response.post_invitation_answers,
      aws_api_gateway_method.get_invitation_answer,
      aws_api_gateway_integration.get_invitation_answer,
      aws_api_gateway_integration_response.get_invitation_answer,
      aws_api_gateway_method.options,
      aws_api_gateway_integration.options,
      aws_api_gateway_integration_response.options,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "main" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  deployment_id = aws_api_gateway_deployment.main.id
  stage_name    = var.api_stage_name

  # 既存の設定と同じく、キャッシュ・X-Ray・アクセスログはいずれも無効のまま
  cache_cluster_enabled = false
  xray_tracing_enabled  = false
}

# --- 認可エラー時のレスポンス ---

# IAM 認可を有効にすると、署名が無い・期限切れのリクエストは API Gateway が
# 統合に到達する前に 403 で返す。既定のゲートウェイレスポンスには CORS ヘッダが
# 付かないため、ブラウザには「CORS エラー」としか見えず原因が分からなくなる。
# ヘッダを足して、フロント側が素直にエラーを受け取れるようにしている。
resource "aws_api_gateway_gateway_response" "cors" {
  for_each = toset(["DEFAULT_4XX", "DEFAULT_5XX"])

  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = each.value

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = local.cors_origin_literal
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
  }

  # API Gateway 既定のテンプレート。宣言しないと「削除しようとするが消せない」
  # 差分が毎回出るため、実物と同じ内容を明示している
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
}
