terraform {
  # S3 backend のネイティブロック（use_lockfile）を使うため 1.10 以上が必要
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # state は tfstate_s3.tf で作るバケットに置く。
  # state には Cognito の ID など公開したくない値が平文で入るため、
  # バケット名は backend.hcl（Git 管理外）に分けて次のように初期化する:
  #   terraform init -backend-config=backend.hcl
  # backend ブロックは変数を参照できないので、この分割が唯一の手段。
  backend "s3" {
    key    = "wedding-app/terraform.tfstate"
    region = "ap-northeast-1"

    # サーバー側暗号化を要求する（バケット側の既定値とは独立に指定する）
    encrypt = true

    # S3 の条件付き書き込みでロックする。DynamoDB テーブルは不要
    use_lockfile = true
  }
}
