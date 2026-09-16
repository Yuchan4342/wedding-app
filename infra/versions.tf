terraform {
  # import ブロック（宣言的インポート）を使うため 1.5 以上が必要
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # state には Cognito の ID など公開したくない値が入るため、
  # 公開リポジトリで扱う場合はリモート backend を推奨。
  # 値は backend.hcl（Git 管理外）に書き、次のように初期化する:
  #   terraform init -backend-config=backend.hcl
  #
  # backend "s3" {
  #   key          = "wedding-app/terraform.tfstate"
  #   region       = "ap-northeast-1"
  #   encrypt      = true
  #   use_lockfile = true
  # }
}
