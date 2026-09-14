import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { Home } from '@styled-icons/octicons/Home';
import { SignOut as SignOutIcon } from '@styled-icons/octicons/SignOut';

import '../App.css';

import { Dashboard } from '../features/Dashboard';
import { Invitation } from '../features/Invitation';
import Alert from './Alert';
import SignOut from './Amplify/SignOut';
import Error404 from '../Error404';
import withAuthenticator from './Amplify/withAuthenticator';
import { Copyright } from '../configuration';

const FooterHomeIcon = styled(Home).attrs({
  className: 'text-gray-dark hover:text-gray mr-2'
})`
  width: 1.75rem;
  height: 1.75rem;
`;

const FooterSignOutIcon = styled(SignOutIcon).attrs({
  className: 'text-grey-dark hover:text-grey'
})`
  width: 1.75rem;
  height: 1.75rem;
`;

const Site = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1 0 auto;
  width: 100%;
`;

const Footer = styled.footer.attrs({
  className: 'bg-gray-lightest text-gray'
})`
  flex: none;
`;

const FooterInner = styled.div.attrs({
  className: 'px-6 py-8 max-w-xs'
})`
  text-align: center;
  margin: 0 auto;
`;

class App extends Component {
  render() {
    return (
      <Router>
        <Site>
          <Alert />
          <Content>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invitation-form" element={<Invitation />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </Content>
          <Footer>
            <FooterInner>
              <Link to="/" style={{ marginRight: '1em' }}>
                <FooterHomeIcon />
              </Link>
              <SignOut
                  onStateChange={this.props.onStateChange}
                  onAuthEvent={this.props.onAuthEvent}
                >
                <FooterSignOutIcon />
              </SignOut>
              <div className="mt-4 text-sm leading-tight">
                <p>Made by {Copyright.author}</p>
                <p>For {Copyright.for}</p>
              </div>
            </FooterInner>
          </Footer>
        </Site>
      </Router>
    );
  }
}

export default withAuthenticator(App);
