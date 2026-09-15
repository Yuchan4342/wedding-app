// デモモードかどうか。ビルド時の環境変数 REACT_APP_DEMO_MODE=true で有効になる
// （package.json の start:demo / build:demo を参照）。
export const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
