import React from 'react';
import { Auth, Logger } from 'aws-amplify';
import { AuthPiece } from 'aws-amplify-react';

const logger = new Logger('SignOut');

class SignOut extends AuthPiece {
  constructor(props) {
    super(props);

    this.signOut = this.signOut.bind(this);
  }

  signOut() {
    Auth.signOut()
      .then(() => {
        this.changeState('signedOut');
      })
      .catch(err => {
        logger.error(err);
      });
  }

  render() {
    return (
      <span className="cursor-pointer" onClick={this.signOut}>
        {this.props.children}
      </span>
    );
  }
}

export default SignOut;
