#!/usr/bin/env bash

# workspace.dsl を検証し、図（SVG）を再生成する。
#
#   workspace.dsl --[structurizr]--> *.puml --[plantuml]--> *.svg
#
# どちらも Docker で動かすので、ローカルに Java や CLI を入れる必要はない。
# PlantUML はサービスのアイコンを URL から取得するため、実行にはネットワーク接続が必要。
#
# USAGE: docs/architecture/export.sh   # どのディレクトリから実行してもよい

set -eu

arch_dir="$(cd "$(dirname "$0")" && pwd)"

# 日本語フォント入りの PlantUML イメージ。初回だけビルドが走る（Dockerfile 参照）
plantuml_image="wedding-app/plantuml-ja"

structurizr() {
  docker run --rm -v "${arch_dir}:/usr/local/structurizr" structurizr/structurizr "$@"
}

plantuml() {
  docker run --rm -v "${arch_dir}:/data" -w /data "${plantuml_image}" "$@"
}

structurizr validate -w workspace.dsl
structurizr export -w workspace.dsl -f plantuml -o .

docker build -q -t "${plantuml_image}" "${arch_dir}" > /dev/null

# 凡例（*-key.puml）は README で使っていないので描画しない
rm -f "${arch_dir}"/structurizr-*-key.puml
plantuml -tsvg 'structurizr-*.puml'

# .puml は .svg の中間生成物なので残さない（.gitignore 済み）
rm -f "${arch_dir}"/structurizr-*.puml

echo
echo "生成されたファイル:"
ls -1 "${arch_dir}"/*.svg
