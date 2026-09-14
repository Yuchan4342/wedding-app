import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import colors from '../../colors';
import { eventInfo } from '../../configuration';

const AnswerButton = styled.div.attrs({
  className: 'py-2 px-4 rounded shadow'
})`
  color: ${colors['white']};
  background-color: ${colors['blue-dark']};
  border: 1px solid;

  &:hover {
    color: ${colors['blue-dark']};
    background-color: ${colors['white']};
  }
`;

const InvitationMessage = () => (
  <div className="flex justify-center">
    <div className="px-4 py-8 max-w-md w-full bg-gray-lightest sm:rounded">
      <div className="mb-2 leading-loose">
        皆様にはご健勝のこととお慶び申し上げます
        <br className="block" />
        このたび  私たちは 
        <br className="block" />
        結婚式を挙げることになりました
        <br className="block" />
        つきましては  親しい皆様の末永いお力添えをいただきたく
        <br className="block" />
        心ばかりの小宴をもうけたいと存じます
        <br className="block" />
        おいそがしい中と存じますが
        <br className="block" />
        ご列席くださいますようお願い申し上げます
      </div>
      <div className="text-sm mt-4">
        {eventInfo.invitationIssuedOn}
      </div>
      <div className="mt-2">
        {eventInfo.groomName}
        <br className="block" />
        {eventInfo.brideName}
      </div>
      <div className="mb-4 mt-8">
        以下のボタンより  出欠のご回答をお願い申し上げます
      </div>
      <div className="my-4">
        <Link to="invitation-form" className="text-lg hover:no-underline">
          <AnswerButton>出欠を回答する</AnswerButton>
        </Link>
      </div>
      <p className="text-sm leading-tight text-pink">
        なお  誠に勝手ながら{eventInfo.rsvpDeadline}までに
        <br className="block" />
        ご回答いただければ幸いに存じます
      </p>
    </div>
  </div>
);

export default InvitationMessage;
