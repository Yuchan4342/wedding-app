import React, { Fragment } from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { Timer } from '@styled-icons/material/Timer';

import { eventInfo } from '../../configuration';

const balloonBgColor = '#354352';

const Balloon = styled.div`
  position: relative;
  margin-top: 16px;
  padding: 1rem;
  background: ${balloonBgColor};
  border: 2px solid white;
  border-radius: 4px;

  &:before,
  &:after {
    position: absolute;
    bottom: 100%;
    left: 50%;
    border: solid transparent;
    content: '';
    pointer-events: none;
  }

  &:before {
    border-bottom-color: white;
    border-width: 16px;
    margin-left: -16px;
  }

  &:after {
    border-bottom-color: ${balloonBgColor};
    border-width: 13px;
    margin-left: -13px;
  }
`;

const BalloonContent = styled.div`
  color: white;
`;

const CountdownIcon = styled(Timer)`
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
`;

const startAt = DateTime.fromISO(
  [eventInfo.date, eventInfo.ceremonyStartTime].join('T')
);

const endAt = DateTime.fromISO(
  [eventInfo.date, eventInfo.partyEndTime].join('T')
);

const restOfDaysAndTimes = now => {
  return startAt.diff(now).toFormat("d'日 と 'h'時間'");
};

const renderContent = now => {
  const started = now > startAt;
  const ended = now > endAt;

  if (ended) {
    return (
      <p>
        お越しいただきありがとうございました
        <br />
        楽しめていただけたのであれば幸いです
        <br />
        これからも私達ふたりのことをよろしくお願いいたします！
      </p>
    );
  }

  if (started) {
    return (
      <p>
        ただいま開催中です！
        <br />
        楽しんでいってね
      </p>
    );
  }

  return (
    <Fragment>
      <p>開催まで…</p>
      <div className="flex items-center justify-center text-xl text-yellow-dark">
        <CountdownIcon />
        {restOfDaysAndTimes(now)}
      </div>
      <p>だよ！！</p>
    </Fragment>
  );
};

const CountDown = () => {
  const now = DateTime.local();
  // const now = DateTime.fromISO('2018-12-01T18:30');

  return (
    <div className="mt-4 mb-8 mx-4">
      <Balloon className="leading-loose sm:max-w-md mx-auto">
        <BalloonContent>{renderContent(now)}</BalloonContent>
      </Balloon>
    </div>
  );
};

export default CountDown;
