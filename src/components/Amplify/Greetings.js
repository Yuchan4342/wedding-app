import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Auth } from 'aws-amplify';
import { Greetings as GreetingsOrig } from 'aws-amplify-react';

import { doneAuthFirstRequest } from '../../actions/auth';

// 最初のログイン状態問い合わせのために finally の処理だけ追加して上書き
class Greetings extends GreetingsOrig {
  checkUser() {
    const that = this;
    const { authState } = this.state;
    return Auth.currentAuthenticatedUser()
      .then(user => {
        if (!that._isMounted) {
          return;
        }
        if (authState !== 'signedIn') {
          this.setState({
            authState: 'signedIn',
            authData: user
          });
          this.changeState('signedIn', user);
        }
      })
      .catch(err => {
        if (!that._isMounted) {
          return;
        }
        if (!authState || authState === 'signedIn') {
          this.setState({ authState: 'signIn' });
          this.changeState('signIn');
        }
      })
      .finally(() => {
        this.props.doneAuthFirstRequest();
      });
  }
}

export default connect(
  undefined,
  dispatch => bindActionCreators({ doneAuthFirstRequest }, dispatch)
)(Greetings);
