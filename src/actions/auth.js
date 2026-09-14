export const AUTH_STATE_CHANGE = 'AUTH_STATE_CHANGE';
export const AUTH_FIRST_REQUEST_DONE = 'AUTH_FIRST_REQUEST_DONE';

export function doneAuthFirstRequest() {
  return { type: AUTH_FIRST_REQUEST_DONE };
}

export function changeAuthState(state, data) {
  return {
    type: AUTH_STATE_CHANGE,
    state: state,
    username: data && data.username
  };
}
