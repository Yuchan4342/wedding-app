import { load, save } from './storage';

// aws-amplify の API のうち、このアプリが呼ぶ GET / POST だけをデモ用に実装したもの。
// 回答はユーザー名ごとに sessionStorage へ保存し、API Gateway には一切通信しない。
const ANSWERS_KEY = 'answers';
const ANSWERS_PATH = '/invitation-answers';

function loadAnswers() {
  return load(ANSWERS_KEY) || {};
}

const demoApi = {
  get(_apiName, path) {
    if (!path.startsWith(`${ANSWERS_PATH}/`)) {
      return Promise.reject(new Error(`unsupported path: ${path}`));
    }

    const userId = decodeURIComponent(path.slice(ANSWERS_PATH.length + 1));
    // 未回答のときは本番 API と同じく userId を含まない空のオブジェクトを返す
    return Promise.resolve(loadAnswers()[userId] || {});
  },

  post(_apiName, path, init) {
    if (path !== ANSWERS_PATH) {
      return Promise.reject(new Error(`unsupported path: ${path}`));
    }

    const body = (init && init.body) || {};
    save(ANSWERS_KEY, { ...loadAnswers(), [body.userId]: body });
    return Promise.resolve(body);
  }
};

export default demoApi;
