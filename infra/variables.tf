# 公開リポジトリに実値を残さないため、識別子系の変数にはデフォルトを置かず、
# Git 管理外の terraform.tfvars で与える方針にしている（terraform.tfvars.sample 参照）。

variable "aws_region" {
  description = "リソースを作成するリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "aws_profile" {
  description = "使用する AWS CLI プロファイル名。既定のクレデンシャルを使う場合は null"
  type        = string
  default     = null
}

variable "tags" {
  description = "全リソースに付与するタグ"
  type        = map(string)
  default = {
    Project   = "wedding-app"
    ManagedBy = "terraform"
  }
}

# --- 静的ホスティング ---

variable "site_bucket_name" {
  description = "SPA を配信する S3 バケット名（独自ドメイン名と同一）"
  type        = string
}

variable "site_deployer_user_arn" {
  description = "bin/deploy から s3 sync を行う IAM ユーザーの ARN。バケットポリシーで書き込みを許可する"
  type        = string
}

variable "cloudflare_ip_ranges" {
  description = <<-EOT
    バケットの公開読み取りを許可する送信元 IP。Cloudflare 経由のアクセスだけを通すためのもの。
    最新の一覧は https://www.cloudflare.com/ips-v4 で配布されており、変わることがあるので定期的に見直す。
  EOT
  type        = list(string)
  default = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ]
}

variable "noncurrent_version_expiration_days" {
  description = "バージョニングで残った旧世代オブジェクトを削除するまでの日数"
  type        = number
  default     = 180
}

# --- 認証（Cognito） ---

variable "user_pool_name" {
  description = "Cognito User Pool 名"
  type        = string
  default     = "wedding"
}

variable "identity_pool_name" {
  description = "Cognito Identity Pool 名"
  type        = string
  default     = "wedding"
}

variable "cognito_reply_to_email" {
  description = "Cognito が送るメールの Reply-To アドレス"
  type        = string
}

variable "cognito_authenticated_role_arn" {
  description = "Identity Pool の authenticated ロール ARN"
  type        = string
}

# --- データストア / API ---

variable "dynamodb_table_name" {
  description = "出欠回答を保存する DynamoDB テーブル名"
  type        = string
  default     = "WedatInvitationAnswers"
}

variable "dynamodb_read_capacity" {
  description = "プロビジョンド読み込みキャパシティ"
  type        = number
  default     = 5
}

variable "dynamodb_write_capacity" {
  description = "プロビジョンド書き込みキャパシティ"
  type        = number
  default     = 5
}

variable "api_name" {
  description = "API Gateway REST API 名"
  type        = string
  default     = "wedding-app"
}

variable "api_stage_name" {
  description = "API Gateway のステージ名。フロントの endpoint 末尾と一致させる"
  type        = string
  default     = "prod"
}

variable "api_integration_role_arn" {
  description = "API Gateway が DynamoDB を呼ぶときに引き受ける IAM ロールの ARN"
  type        = string
}

variable "cors_allow_origin" {
  description = "CORS で許可するオリジン。現状は '*'（シングルクォートは VTL 由来ではなく API Gateway のリテラル記法）"
  type        = string
  default     = "*"
}
