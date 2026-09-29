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

# Structurizr は線のスタイルに fill（塗り）を指定してくるが、線は stroke（輪郭）で
# 描くものなので、塗りが白のままだと曲がった線が白く塗りつぶされて途切れて見える。
# GitHub のレンダリングでも同じことが起きるため、生成のたびに打ち消しておく。
# （sed -i は GNU と BSD で書き方が違うので、一時ファイルを経由する）
for mmd in "${arch_dir}"/structurizr-*.mmd; do
  sed 's/^  linkStyle default fill:#ffffff$/  linkStyle default fill:none,stroke:#444444/' \
    "${mmd}" > "${mmd}.tmp"
  mv "${mmd}.tmp" "${mmd}"
done

echo
echo "生成されたファイル:"
ls -1 "${arch_dir}"/*.mmd
echo
echo "README.md の mermaid ブロックも更新してください。"
