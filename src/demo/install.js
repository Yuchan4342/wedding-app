import { Auth, API } from 'aws-amplify';

import demoAuth from './auth';
import demoApi from './api';

// aws-amplify の Auth / API はモジュール単位のシングルトンで、
// aws-amplify-react の SignIn なども同じインスタンスを参照している。
// そのメソッドをデモ実装で上書きすることで、コンポーネント側を変更せずに
// 認証と API をモックに差し替える。
export function installDemoBackend() {
  Object.assign(Auth, demoAuth);
  Object.assign(API, demoApi);
}
