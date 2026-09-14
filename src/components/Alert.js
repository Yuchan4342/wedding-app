import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import Transition from 'react-transition-group/Transition';
import { Smile, Meh } from '@styled-icons/fa-regular';
import { Close } from '@styled-icons/material/Close';

import { closeAlert } from '../actions/alert';
import { bindActionCreators } from 'redux';
import { teal, red } from '../colors';

const SuccessIcon = styled(Smile)`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;
  color: ${teal};
`;

const DangerIcon = styled(Meh)`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;
  color: ${red};
`;

const CloseIcon = styled(Close).attrs({
  className: 'cursor-pointer'
})`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  height: 1rem;
  color: ${({ color }) => color};
`;

const Positioner = styled.div`
  z-index: 102;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const Box = styled.div.attrs({
  className: 'bg-white rounded shadow-lg'
})`
  position: relative;
  margin: 0 1rem;
  padding: 1.5rem;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 20rem;
  min-height: 8rem;
  border-top: solid 4px ${({ color }) => color};
  pointer-events: auto;
  transition: 0.25s all cubic-bezier(0.4, 0, 0.2, 1.2);
  transform: scale(0);
  opacity: 0;

  ${({ transitionState }) =>
    transitionState === 'exiting' &&
    css`
      opacity: 0;
      transform: scale(0);
      transition: 0.2s all cubic-bezier(0.6, -0.2, 0.8, 1);
    `};

  ${({ transitionState }) =>
    transitionState === 'entered' &&
    css`
      opacity: 1;
      transform: scale(1);
    `};
`;

const Message = styled.div.attrs({
  className: 'text-grey-darkest leading-normal'
})`
  flex: 1;
  white-space: pre-line;
`;

const Alert = ({ context, show, message, closeAlert }) => {
  let Icon = SuccessIcon;
  let color = teal;

  if (context === 'danger') {
    Icon = DangerIcon;
    color = red;
  }

  return (
    <Transition in={show} timeout={{ enter: 0, exit: 200 }} unmountOnExit>
      {state => (
        <Positioner>
          <Box transitionState={state} color={color}>
            <div className="flex-none">
              <Icon />
            </div>
            <Message>{message}</Message>
            <CloseIcon onClick={closeAlert} color={color} />
          </Box>
        </Positioner>
      )}
    </Transition>
  );
};

export default connect(
  ({ alert }) => ({
    show: alert.show,
    context: alert.context,
    message: alert.message
  }),
  dispatch => bindActionCreators({ closeAlert }, dispatch)
)(Alert);
