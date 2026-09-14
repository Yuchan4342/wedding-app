import { ALERT_OPEN, ALERT_CLOSE } from '../actions/alert';

const initialState = { show: false, message: '' };

export default function(state = initialState, action) {
  switch (action.type) {
    case ALERT_OPEN: {
      return {
        ...state,
        message: action.message,
        context: action.context,
        show: true
      };
    }
    case ALERT_CLOSE: {
      return {
        ...state,
        message: '',
        show: false
      };
    }
    default: {
      return state;
    }
  }
}
