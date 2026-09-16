# ゲストごとのアカウントを発行する User Pool。
# サインアップは開放しておらず、招待客 1 人ひとりのユーザー名と初期パスワードを
# 管理者が User Pool 上に手動で作成して配る運用（AdminCreateUser 相当）。
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # 管理者が設定したユーザー名を、大文字小文字を区別せず受け付ける
  username_configuration {
    case_sensitive = false
  }

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = false
    require_numbers                  = false
    require_symbols                  = false
    temporary_password_validity_days = 60
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  mfa_configuration        = "OFF"
  auto_verified_attributes = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  email_configuration {
    email_sending_account  = "COGNITO_DEFAULT"
    reply_to_email_address = var.cognito_reply_to_email
  }

  # パスワードを忘れたゲストには管理者が再発行する
  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
      priority = 1
    }
  }

  # 標準属性のみを使っており、カスタム属性は無いため schema ブロックは宣言しない
  deletion_protection = "ACTIVE"
}

# フロントエンド（configuration.local.js の userPoolWebClientId）が使うクライアント。
resource "aws_cognito_user_pool_client" "web" {
  name         = "wedding_client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Amplify の Auth.signIn は SRP を使う。クライアントシークレットは発行しない
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  auth_session_validity         = 3
  enable_token_revocation       = true
  prevent_user_existence_errors = "ENABLED"

  read_attributes  = local.user_pool_client_read_attributes
  write_attributes = local.user_pool_client_write_attributes
}

# コンソール作業中に作られたもう 1 つのクライアント。
# 現状フロントからは参照されていないため、不要なら import せず削除してよい。
resource "aws_cognito_user_pool_client" "web_secondary" {
  name         = "wedding_client2"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  auth_session_validity         = 3
  enable_token_revocation       = true
  prevent_user_existence_errors = "ENABLED"

  read_attributes  = local.user_pool_client_read_attributes
  write_attributes = local.user_pool_client_write_attributes
}

locals {
  # コンソールで作成したときの既定値と同じ集合。差分を出さないため明示している
  user_pool_client_write_attributes = [
    "address",
    "birthdate",
    "email",
    "family_name",
    "gender",
    "given_name",
    "locale",
    "middle_name",
    "name",
    "nickname",
    "phone_number",
    "picture",
    "preferred_username",
    "profile",
    "updated_at",
    "website",
    "zoneinfo",
  ]

  user_pool_client_read_attributes = concat(
    local.user_pool_client_write_attributes,
    ["email_verified", "phone_number_verified"],
  )
}

# ログイン済みゲストに一時的な AWS クレデンシャルを渡す Identity Pool。
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = var.identity_pool_name
  allow_unauthenticated_identities = false
  allow_classic_flow               = false

  cognito_identity_providers {
    provider_name           = "cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
    client_id               = aws_cognito_user_pool_client.web.id
    server_side_token_check = false
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated = var.cognito_authenticated_role_arn
  }
}
