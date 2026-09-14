export const ALERT_OPEN = 'ALERT_OPEN';
export const ALERT_CLOSE = 'ALERT_CLOSE';

export function openAlertSuccess(message) {
  return {
    type: ALERT_OPEN,
    context: 'success',
    message
  };
}

export function openAlertDanger(message) {
  return {
    type: ALERT_OPEN,
    context: 'danger',
    message
  };
}

export function closeAlert() {
  return {
    type: ALERT_CLOSE
  };
}
