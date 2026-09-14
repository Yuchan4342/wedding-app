import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { API } from 'aws-amplify';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import _ from 'lodash';
import styled from 'styled-components';

import InvitationForm from './InvitationForm';
import AllergyEntryNotice from './AllergyEntryNotice';
import { eventInfo } from '../../configuration';
import { submitInvitationAnswer } from '../../actions/invitationAnswer';
import { openAlertSuccess, openAlertDanger } from '../../actions/alert';

const Title = styled.h1.attrs({
  className: 'mt-12 mb-8 text-white text-2xl'
})`
  font-family: 'Caveat', cursive;
  font-weight: normal;
  letter-spacing: 0.5rem;
`;

function thanksMessage(attendance) {
  return attendance === 'true'
    ? 'ご回答ありがとうございました\n当日お会いできるのを楽しみにしています！'
    : 'ご回答ありがとうございました\n残念ですがまた別の機会にでもお会いしましょう！';
}

function sanitizeArrayField(values) {
  const additionalAttendees = _.compact(values.additionalAttendees);
  if (additionalAttendees.length === 0)
    return _.omit(values, 'additionalAttendees');

  return { ...values, additionalAttendees };
}

// temporary fix for missing api gateway escapes
function removeJSONInvalidChars(values) {
  const safeValues = _.clone(values);

  if (safeValues.address) {
    safeValues.address = safeValues.address.replace(/[\n"{}]/g, '');
  }
  if (safeValues.message) {
    safeValues.message = safeValues.message.replace(/[\n"{}]/g, '');
  }
  if (safeValues.note) {
    safeValues.note = safeValues.note.replace(/[\n"{}]/g, '');
  }

  return safeValues;
}

class Invitation extends Component {
  constructor(props) {
    super(props);

    this.submit = this.submit.bind(this);
  }

  submit(values) {
    const createdAt = DateTime.local().toString();
    const body = {
      userId: this.props.userId,
      ...removeJSONInvalidChars(sanitizeArrayField(values)),
      createdAt
    };

    API.post('wedding-app', '/invitation-answers', { body })
      .then(() => {
        this.props.submitInvitationAnswer(values.attendance);
        //this.props.history.push('/');
        this.props.openAlertSuccess(thanksMessage(values.attendance));
      })
      .catch(error => {
        this.props.openAlertDanger(
          'エラーが発生しました\nお手数ですが時間をおいて再度お試しください'
        );
        // console.log(error);
      });
  }

  render() {
    return (
      <div className="flex flex-col items-center">
        <Title>Invitation Form</Title>
        <div className="mb-12 p-4 w-full max-w-sm bg-gray-lightest rounded">
          {this.props.submitted ? (
            <div className="text-center">
              <div className="mb-4">回答済みです</div>
              {this.props.attendance === 'true' && (
                <div>
                  {eventInfo.guestSiteUrl && (
                    <div className="mb-4">
                      ご列席者様専用サイトを<br />
                      <a href={eventInfo.guestSiteUrl} target="_blank" rel="noopener noreferrer">こちら</a>に ご用意しております<br />
                      ぜひご覧いただき<br />
                      結婚式までの時間をお楽しみ<br />
                      いただけましたら 幸いです
                    </div>
                  )}
                  <AllergyEntryNotice />
                </div>
              )}
              <div>
                <Link to="/" className="mb-4">トップページ</Link>
              </div>
            </div>
          ) : (
            <InvitationForm onSubmit={this.submit} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  ({ auth, invitationAnswer }) => ({
    userId: auth.username,
    submitted: invitationAnswer.submitted,
    attendance: invitationAnswer.attendance
  }),
  dispatch =>
    bindActionCreators(
      { submitInvitationAnswer, openAlertSuccess, openAlertDanger },
      dispatch
    )
)(Invitation);
