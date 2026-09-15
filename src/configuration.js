// 設定値の切り替えモジュール。
// - 通常モード: src/configuration.local.js（Git 管理外。configuration.demo.js をコピーして作成）
// - デモモード: src/configuration.demo.js（Git 管理。サンプル値）
//
// process.env.REACT_APP_DEMO_MODE はビルド時に定数へ置き換えられ、webpack は
// 成立しない側の分岐を捨てるので、デモビルドに configuration.local.js は含まれない
// （ファイルが無くてもデモビルドは通る）。そのため import ではなく require で分岐している。
let conf;
if (process.env.REACT_APP_DEMO_MODE === 'true') {
  conf = require('./configuration.demo');
} else {
  conf = require('./configuration.local');
}

export const eventInfo = conf.eventInfo;
export const Copyright = conf.Copyright;

export default conf.default;
