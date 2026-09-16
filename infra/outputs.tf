# src/configuration.local.js に転記する値。
# ID そのものは秘密ではないが公開する必要もないので sensitive にしている。
# 値を見るときは `terraform output -json frontend_configuration | jq` を使う。
output "frontend_configuration" {
  description = "configuration.local.js の amplifyAuth / amplifyAPI に対応する値"
  sensitive   = true

  value = {
    amplifyAuth = {
      region              = var.aws_region
      identityPoolId      = aws_cognito_identity_pool.main.id
      userPoolId          = aws_cognito_user_pool.main.id
      userPoolWebClientId = aws_cognito_user_pool_client.web.id
    }
    amplifyAPI = {
      endpoint = aws_api_gateway_stage.main.invoke_url
    }
  }
}

output "site_bucket" {
  description = ".deployrc の DEPLOY_S3_BUCKET に対応するバケット名"
  value       = aws_s3_bucket.site.bucket
}

output "site_website_endpoint" {
  description = "Cloudflare のオリジンに指定する S3 ウェブサイトエンドポイント"
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
}

output "dynamodb_table_name" {
  description = "出欠回答テーブル名"
  value       = aws_dynamodb_table.invitation_answers.name
}
