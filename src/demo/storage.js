// デモモードの状態は sessionStorage に持つ。
// リロードしても維持されるが、タブを閉じれば消え、他の訪問者とは共有されない。
const PREFIX = 'wedding-app-demo';

function key(name) {
  return `${PREFIX}:${name}`;
}

export function load(name) {
  try {
    const json = sessionStorage.getItem(key(name));
    return json ? JSON.parse(json) : null;
  } catch (_e) {
    return null;
  }
}

export function save(name, value) {
  try {
    sessionStorage.setItem(key(name), JSON.stringify(value));
  } catch (_e) {
    // プライベートモードなどで使えない場合は保持しない
  }
}

export function remove(name) {
  try {
    sessionStorage.removeItem(key(name));
  } catch (_e) {
    // 同上
  }
}
