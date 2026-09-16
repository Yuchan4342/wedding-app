# SPA を配信する S3 バケット（静的ウェブサイトホスティング）。
# ブラウザからは Cloudflare を経由してアクセスされ、バケットは Cloudflare の
# IP レンジからの GetObject だけを許可している。
resource "aws_s3_bucket" "site" {
  bucket = var.site_bucket_name
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  # SPA なので 404 も index.html に返し、React Router 側でルーティングさせる
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    id     = "Purge180days"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# ACL による公開はせず、送信元 IP を絞ったバケットポリシーだけで公開している。
# aws:SourceIp 条件付きのポリシーはパブリックとみなされないため、
# BlockPublicPolicy を有効にしたままでも共存できる。
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

locals {
  # aws_s3_bucket.site.arn を参照すると import 中は値が確定せず plan で差分が
  # 読めなくなるため、バケット名から ARN を組み立てている
  site_bucket_arn = "arn:aws:s3:::${var.site_bucket_name}"
}

data "aws_iam_policy_document" "site_bucket" {
  statement {
    sid     = "PublicReadGetObject"
    effect  = "Allow"
    actions = ["s3:GetObject"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    resources = ["${local.site_bucket_arn}/*"]

    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values   = var.cloudflare_ip_ranges
    }
  }

  statement {
    sid     = "AllowAccessObject"
    effect  = "Allow"
    actions = ["s3:*"]

    principals {
      type        = "AWS"
      identifiers = [var.site_deployer_user_arn]
    }

    resources = ["${local.site_bucket_arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_bucket.json

  # ポリシーの投入は public access block の設定後に行う
  depends_on = [aws_s3_bucket_public_access_block.site]
}
