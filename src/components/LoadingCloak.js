import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import Transition from 'react-transition-group/Transition';

const Cloak = styled.div`
  position: fixed;
  z-index: 100;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  position: relative;
  z-index: 101;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  transition: all 0.7s ease-out;

  ${props =>
    props.transitionState === 'exiting' &&
    css`
      opacity: 0;
    `};
`;

const ripple = keyframes`
  0% {
    top: 90px;
    left: 90px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0;
    left: 0;
    width: 180px;
    height: 180px;
    opacity: 0;
  }
`;

const SpinnerInner = styled.div`
  position: absolute;
  border: 8px solid #3498db;
  opacity: 1;
  border-radius: 50%;
  animation: ${ripple} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;

  &:nth-child(2) {
    animation-delay: -0.5s;
  }
`;

// #51648a or #dae1e7
const Door = styled.div`
  position: fixed;
  z-index: 100;
  top: 0;
  bottom: 0;
  width: 51%;
  background: #dae1e7;
  transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
`;

const DoorLeft = styled(Door)`
  left: 0;

  ${props =>
    props.transitionState === 'exiting' &&
    css`
      transform: translateX(-100%);
    `};
`;

const DoorRight = styled(Door)`
  right: 0;

  ${props =>
    props.transitionState === 'exiting' &&
    css`
      transform: translateX(100%);
    `};
`;

const LoadingCloakWithTransition = ({ loading }) => {
  return (
    <Transition in={loading} timeout={1000} unmountOnExit>
      {state => (
        <div>
          <Cloak>
            <Spinner transitionState={state}>
              <SpinnerInner />
              <SpinnerInner />
            </Spinner>
            <DoorLeft transitionState={state} />
            <DoorRight transitionState={state} />
          </Cloak>
        </div>
      )}
    </Transition>
  );
};

export default LoadingCloakWithTransition;
