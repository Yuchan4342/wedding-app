# 出欠回答を 1 ゲスト 1 アイテムで保存するテーブル。
# API Gateway のマッピングテンプレートから GetItem / PutItem で直接読み書きする。
resource "aws_dynamodb_table" "invitation_answers" {
  name         = var.dynamodb_table_name
  billing_mode = "PROVISIONED"
  table_class  = "STANDARD"
  hash_key     = "userId"

  read_capacity  = var.dynamodb_read_capacity
  write_capacity = var.dynamodb_write_capacity

  # userId 以外の属性はスキーマレスなので定義しない（キー属性のみ宣言する）
  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = false
  }

  deletion_protection_enabled = false
}
