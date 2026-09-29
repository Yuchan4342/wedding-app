# 日本語を描画できる PlantUML。
# 公式イメージ（Ubuntu ベース）には CJK フォントが入っておらず、
# 日本語がすべて豆腐（□）になるため、Noto Sans CJK を足している。
# workspace.dsl の plantuml.skinparams で defaultFontName に指定している。
FROM plantuml/plantuml:latest

USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*
