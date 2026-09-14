import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import DashboardCover from './DashboardCover';
import InvitationMessage from './InvitationMessage';
import InformationSection from './InformationSection';
import EmbededGoogleMap from './EmbededGoogleMap';
import CountDown from './Countdown';
import { eventInfo } from '../../configuration';

const CoverTitle = styled.h1.attrs({
  className: 'mb-4 px-4 w-full text-5xl sm:mb-12'
})`
  font-family: 'Caveat', cursive;
  font-weight: normal;
  opacity: 0.9;
`;

const SectionTitle = styled.h1.attrs({
  className: 'mt-8 mb-4 text-white text-3xl'
})`
  font-family: 'Caveat', cursive;
  font-weight: normal;
  letter-spacing: 0.5rem;

  &:after {
    display: block;
    content: '★★★★★';
    font-size: 0.5rem;
    margin: 0.5rem 0 1rem 0;
    letter-spacing: 0.25rem;
  }
`;

// const Dashboard = ({ invitationAnswered }) => (
const Dashboard = () => (
  <div className="text-center leading-normal">
    <DashboardCover>
      <CoverTitle>Welcome to Our Happiest Event</CoverTitle>
    </DashboardCover>

    {/* {!invitationAnswered && (
      <div>
        <SectionTitle>Invitation</SectionTitle>
        <InvitationMessage />
      </div>
    )} */}
    <div>
      <SectionTitle>Invitation</SectionTitle>
      <InvitationMessage />
    </div>

    <SectionTitle>Information</SectionTitle>
    <InformationSection />

    {eventInfo.googleMapKey && (
      <div>
        <SectionTitle>MAP</SectionTitle>
        <EmbededGoogleMap />
      </div>
    )}

    <CountDown />
  </div>
);

export default connect(({ invitationAnswer }) => ({
  invitationAnswered: invitationAnswer.submitted
}))(Dashboard);
