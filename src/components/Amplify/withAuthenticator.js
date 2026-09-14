import React, { Component } from 'react';
import { Authenticator, RequireNewPassword } from 'aws-amplify-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { API } from 'aws-amplify';

import SignIn from './SignIn';
import Greetings from './Greetings';
import { changeAuthState } from '../../actions/auth';
import { fetchInvitationAnswerSuccess } from '../../actions/invitationAnswer';
import LoadingCloak from '../LoadingCloak';

export default function withAuthenticator(Comp) {
  class CompWithAuth extends Component {
    constructor(props) {
      super(props);

      this.handleAuthStateChange = this.handleAuthStateChange.bind(this);

      this.state = {
        authState: props.authState || null,
        authData: props.authData || null
      };
    }

    handleAuthStateChange(state, data) {
      this.setState({ authState: state, authData: data });
      this.props.changeAuthState(state, data);

      if (state === 'signedIn') {
        this.props.fetchInvitationAnswer(data.username);
      }
    }

    render() {
      const { authState, authData } = this.state;
      const signedIn = authState === 'signedIn';
      // TODO: LoadingCloak が別々に登場しているのをなんとかする
      if (signedIn) {
        return (
          <div>
            <LoadingCloak loading={this.props.loading} />
            <Comp
              {...this.props}
              authState={authState}
              authData={authData}
              onStateChange={this.handleAuthStateChange}
            />
          </div>
        );
      }

      return (
        <div>
          <LoadingCloak loading={this.props.loading} />
          <Authenticator
            {...this.props}
            hideDefault={true}
            onStateChange={this.handleAuthStateChange}
          >
            <Greetings />
            <SignIn />
            <RequireNewPassword />
          </Authenticator>
        </div>
      );
    }
  }

  const fetchInvitationAnswer = dispatch => userId => {
    API.get('wedding-app', `/invitation-answers/${userId}`)
      .then(data => {
        dispatch(fetchInvitationAnswerSuccess(data));
      })
      .catch(error => {
        console.log(error.response);
      });
  };

  return connect(
    ({ auth }) => ({ loading: !auth.firstRequestDone }),
    dispatch => ({
      ...bindActionCreators({ changeAuthState }, dispatch),
      fetchInvitationAnswer: fetchInvitationAnswer(dispatch)
    })
  )(CompWithAuth);
}
