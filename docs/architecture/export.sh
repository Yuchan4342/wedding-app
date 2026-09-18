#!/usr/bin/env bash

# workspace.dsl を検証し、Mermaid（structurizr-<viewKey>.mmd）を再生成する。
# Docker の structurizr/structurizr を使うので、ローカルに Java や CLI を入れる必要はない。
# （旧 structurizr/cli イメージは非推奨化され、バナーを出すだけで動かないため使わない）
#
# USAGE: docs/architecture/export.sh   # どのディレクトリから実行してもよい

set -eu

arch_dir="$(cd "$(dirname "$0")" && pwd)"
image="structurizr/structurizr"

structurizr() {
  docker run --rm -v "${arch_dir}:/usr/local/structurizr" "${image}" "$@"
}

structurizr validate -w workspace.dsl
structurizr export -w workspace.dsl -f mermaid -o .

echo
echo "生成されたファイル:"
ls -1 "${arch_dir}"/*.mmd
echo
echo "README.md の mermaid ブロックも更新してください。"
