import {
  INVITATION_ANSWER_SUBMIT,
  INVITATION_ANSWER_FETCH_SUCCESS
} from '../actions/invitationAnswer';

const initialState = { submitted: false };

export default function(state = initialState, action) {
  switch (action.type) {
    case INVITATION_ANSWER_SUBMIT: {
      return {
        ...state,
        submitted: true,
        attendance: action.attendance
      };
    }
    case INVITATION_ANSWER_FETCH_SUCCESS: {
      return {
        ...state,
        answer: action.invitationAnswer,
        submitted: action.submitted,
        attendance: action.invitationAnswer.attendance
      };
    }
    default: {
      return state;
    }
  }
}
