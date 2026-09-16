# Terraform の state を置く S3 バケット。
#
# このバケットは自分自身の state も保持している（versions.tf の backend 設定を参照）。
# 鶏と卵の関係になるため、初回だけ次の順で立ち上げる:
#
#   1. versions.tf の backend ブロックをコメントアウトしたまま terraform apply
#      → ローカル state のままバケットが作られる
#   2. backend ブロックを有効にし、backend.hcl にバケット名を書く
#   3. terraform init -backend-config=backend.hcl -migrate-state
#      → ローカル state（このバケットのレコードを含む）が S3 に移る
#
# 以後はこのバケットが自分のレコードを保持する。terraform destroy で自分の state ごと
# 消してしまう事故を防ぐため prevent_destroy を付けている。
resource "aws_s3_bucket" "tfstate" {
  bucket = var.tfstate_bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

# 過去の state に戻せるようにしておく。誤った apply からの復旧手段になる。
# 1 世代は数十 KB なので、世代が溜まっても容量は問題にならない
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_ownership_controls" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# state には Cognito のプール ID などが平文で入る。公開する理由は一切ない
resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
