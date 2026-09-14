import React from 'react';
import _ from 'lodash';
import { DateTime } from 'luxon';
import styled from 'styled-components';

import { eventInfo } from '../../configuration';

import { CalendarAlt } from '@styled-icons/fa-regular/CalendarAlt';
import { LinkExternal } from '@styled-icons/octicons/LinkExternal';

const LinkExternalIcon = styled(LinkExternal)`
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
`;

const AddToCalendar = styled(CalendarAlt)`
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
`;

const List = styled.dl`
  display: flex;
  width: 100%;
`;

const Term = styled.dt.attrs({
  className: 'text-gray-darker '
})`
  width: 100%;
  max-width: 4em;
`;

const Detail = styled.dd`
  flex: 1;
`;

const receptionStartAt = DateTime.fromISO(
  [eventInfo.date, eventInfo.receptionStartTime].join('T')
);
const ceremonyStartAt = DateTime.fromISO(
  [eventInfo.date, eventInfo.ceremonyStartTime].join('T')
);
const partyStartAt = DateTime.fromISO(
  [eventInfo.date, eventInfo.partyStartTime].join('T')
);
const jpnFormat = 'H時m分';

const googleCalendarEventUri = () => {
  const base = 'https://calendar.google.com/calendar/r/eventedit';
  const query = {
    dates: eventInfo.calendarDateRange,
    text: eventInfo.title,
    location: eventInfo.location,
    details: ''
  };

  const queryString = _.map(query, (val, key) =>
    [key, val].map(encodeURIComponent).join('=')
  ).join('&');

  return `${base}?${queryString}`;
};

const informationSection = () => (
  <div className="my-4 flex justify-center">
    <div className="px-4 py-8 w-full bg-gray-lightest text-left leading-loose max-w-md sm:rounded">
      <List className="mb-2">
        <Term className="font-bold">日時</Term>
        <Detail>
          <div>{ceremonyStartAt.toLocaleString(DateTime.DATE_HUGE)}</div>
          <List>
            <Term>受付</Term>
            <Detail>{receptionStartAt.toFormat(jpnFormat)}</Detail>
          </List>
          <List>
            <Term>挙式</Term>
            <Detail>{ceremonyStartAt.toFormat(jpnFormat)}</Detail>
          </List>
          <List>
            <Term>披露宴</Term>
            <Detail>{partyStartAt.toFormat(jpnFormat)}</Detail>
          </List>
        </Detail>
      </List>
      <List className="mb-2">
        <Term className="font-bold">会場</Term>
        <Detail>
          <a
            href={eventInfo.locationUrl}
            className="flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {eventInfo.location}
            <LinkExternalIcon />
          </a>
        </Detail>
      </List>
      <p className="text-sm text-center">
        <a
          href={googleCalendarEventUri()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <AddToCalendar />
          Google Calendar に追加
        </a>
      </p>
    </div>
  </div>
);

export default informationSection;
