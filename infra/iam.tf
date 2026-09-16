# ログイン済みゲストに API の呼び出しを許可するポリシー。
#
# ロール本体（Cognito_xxxxxx_Role）は Terraform 管理外だが、
# aws_iam_role_policy はロール「名」だけで紐づけられるので、
# ロールを import しなくてもインラインポリシーを 1 つ足せる。
# 既存のポリシーには影響しない（この名前のインラインポリシーだけを排他管理する）。
#
# 必要な権限: iam:GetRolePolicy / iam:PutRolePolicy / iam:DeleteRolePolicy
locals {
  # "arn:aws:iam::<account>:role/service-role/Cognito_xxxxxx_Role" → ロール名
  cognito_authenticated_role_name = basename(var.cognito_authenticated_role_arn)
}

resource "aws_iam_role_policy" "cognito_authenticated_invoke_api" {
  name = "wedding-app-invoke-api"
  role = local.cognito_authenticated_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "execute-api:Invoke"
      Resource = [
        # GET /invitation-answers/{userId}
        "${aws_api_gateway_rest_api.main.execution_arn}/${var.api_stage_name}/GET/invitation-answers/*",
        # POST /invitation-answers
        "${aws_api_gateway_rest_api.main.execution_arn}/${var.api_stage_name}/POST/invitation-answers",
      ]
    }]
  })
}

# NOTE: userId は Cognito の username（管理者が User Pool 上に手動で作成した
# ユーザー名）だが、IAM 認可で参照できるのは Identity Pool の identity id と
# User Pool の sub だけで username とは対応しない。そのため「自分の回答しか
# 読み書きできない」という制約は、このポリシーでは表現できない。
# ログイン済みゲスト同士では他人の userId を指定できる余地が残る。
# そこまで塞ぐには Cognito オーソライザーに変えて、マッピングテンプレートで
# $context.authorizer.claims['cognito:username'] を使う必要がある（フロントの変更も伴う）。

# --- ロール本体について ---
#
# IAM ロールそのものは Terraform の管理下に入れていない。
#
# 理由: aws_iam_role は refresh のたびに iam:ListRolePolicies /
# iam:ListAttachedRolePolicies を呼んで既存のポリシー割り当てを読む。
# これらを持たない権限で import すると plan 自体が失敗するため、
# 先に権限を足してから管理下に入れる必要がある。
#
# ロールを管理下に入れる手順:
#   1. 作業用ユーザーに iam:GetRole, iam:ListRolePolicies, iam:GetRolePolicy,
#      iam:ListAttachedRolePolicies, iam:GetPolicy, iam:GetPolicyVersion を許可する
#   2. 実際に付いているポリシーを確認する
#        aws iam list-attached-role-policies --role-name APIGateway_accessDynamoDB
#        aws iam list-role-policies          --role-name APIGateway_accessDynamoDB
#   3. 下のコメントを外し、確認した内容に合わせて policy を書く
#   4. import する（imports.tf.sample のコメント参照）
#
# なお、ロールを import してもポリシーの割り当てを Terraform 側で宣言しなければ
# 既存のポリシーは剥がされない（aws_iam_role は宣言したものだけを排他管理する）。

# --- API Gateway が DynamoDB を呼ぶためのロール ---
#
# 対象ロール: APIGateway_accessDynamoDB
# 下記は必要な用途を最小権限で書き直した例。差し替えると権限が狭まるため、
# 適用前に GET / POST が通ることを確認すること。
#
# resource "aws_iam_role" "api_gateway_dynamodb" {
#   name        = "APIGateway_accessDynamoDB"
#   description = "Allows DAX to call DynamoDB on your behalf."
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect    = "Allow"
#       Action    = "sts:AssumeRole"
#       Principal = { Service = "apigateway.amazonaws.com" }
#     }]
#   })
# }
#
# resource "aws_iam_role_policy" "api_gateway_dynamodb" {
#   name = "invitation-answers-access"
#   role = aws_iam_role.api_gateway_dynamodb.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect   = "Allow"
#       Action   = ["dynamodb:GetItem", "dynamodb:PutItem"]
#       Resource = aws_dynamodb_table.invitation_answers.arn
#     }]
#   })
# }

# --- Identity Pool の authenticated ロール ---
#
# 対象ロール: service-role/Cognito_xxxxxx_Role
# 信頼ポリシーは Identity Pool の ID を参照しているため、ロールと Identity Pool の
# 間に循環参照が生まれる。Terraform 化する場合は aws_iam_role を先に作り、
# aws_cognito_identity_pool_roles_attachment 側から参照する（現状の構成と同じ）。
#
# resource "aws_iam_role" "cognito_authenticated" {
#   name = "Cognito_xxxxxx_Role"
#   path = "/service-role/"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect    = "Allow"
#       Action    = "sts:AssumeRoleWithWebIdentity"
#       Principal = { Federated = "cognito-identity.amazonaws.com" }
#       Condition = {
#         StringEquals = {
#           "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
#         }
#         "ForAnyValue:StringLike" = {
#           "cognito-identity.amazonaws.com:amr" = "authenticated"
#         }
#       }
#     }]
#   })
# }
