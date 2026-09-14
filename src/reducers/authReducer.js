import { AUTH_STATE_CHANGE, AUTH_FIRST_REQUEST_DONE } from '../actions/auth';

const initialState = { firstRequestDone: false };

export default function(state = initialState, action) {
  switch (action.type) {
    case AUTH_FIRST_REQUEST_DONE: {
      return {
        ...state,
        firstRequestDone: true
      };
    }
    case AUTH_STATE_CHANGE: {
      return {
        ...state,
        state: action.state,
        username: action.username
      };
    }
    default: {
      return state;
    }
  }
}
