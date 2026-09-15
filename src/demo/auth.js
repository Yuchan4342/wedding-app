import { load, save, remove } from './storage';

// aws-amplify の Auth のうち、このアプリと aws-amplify-react の SignIn が
// 実際に呼ぶメソッドだけをデモ用に実装したもの。
// 任意のユーザー名・パスワードでログインでき、Cognito には一切通信しない。
const USER_KEY = 'user';

function invalidParameter(message) {
  return { code: 'InvalidParameterException', message };
}

const demoAuth = {
  currentAuthenticatedUser() {
    const user = load(USER_KEY);
    return user ? Promise.resolve(user) : Promise.reject('not authenticated');
  },

  signIn(username, password) {
    if (!username) {
      return Promise.reject(invalidParameter('ユーザー名を入力してください'));
    }
    if (!password) {
      return Promise.reject(invalidParameter('パスワードを入力してください'));
    }

    const user = { username };
    save(USER_KEY, user);
    return Promise.resolve(user);
  },

  // SignIn.checkContact が呼ぶ。verified が空だと verifyContact 画面に遷移して
  // しまうので、検証済みの連絡先があることにして signedIn に進める。
  verifiedContact(_user) {
    return Promise.resolve({
      verified: { email: 'demo@example.com' },
      unverified: {}
    });
  },

  signOut() {
    remove(USER_KEY);
    return Promise.resolve();
  }
};

export default demoAuth;
