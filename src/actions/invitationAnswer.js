export const INVITATION_ANSWER_SUBMIT = 'INVITATION_ANSWER_SUBMIT';
export const INVITATION_ANSWER_FETCH_SUCCESS =
  'INVITATION_ANSWER_FETCH_SUCCESS';

export function submitInvitationAnswer(attendance) {
  return {
    type: INVITATION_ANSWER_SUBMIT,
    attendance
  };
}

export function fetchInvitationAnswerSuccess(invitationAnswer) {
  const submitted = invitationAnswer.userId !== undefined;

  return {
    type: INVITATION_ANSWER_FETCH_SUCCESS,
    invitationAnswer,
    submitted
  };
}
