import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as reduxFormReducer } from 'redux-form';
import { Settings as LuxonSettings } from 'luxon';
import Amplify from 'aws-amplify';
import { AmplifyTheme } from 'aws-amplify-react';

import App from './components/App';
import authReducer from './reducers/authReducer';
import alertReducer from './reducers/alertReducer';
import invitationAnswerReducer from './reducers/invitationAnswerReducer';
import * as serviceWorker from './serviceWorker';
import conf from './configuration';

import './index.css';

import reportWebVitals from './reportWebVitals';

LuxonSettings.defaultLocale = 'ja';

Amplify.configure({
  Auth: conf.amplifyAuth,
  API: conf.amplifyAPI
});
Amplify.I18n.setLanguage('ja');
Amplify.I18n.putVocabularies(conf.amplifyVocabularies);

const theme = {
  ...AmplifyTheme,
  container: {
    ...AmplifyTheme.container,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  formSection: {
    ...AmplifyTheme.formSection,
    width: '100%',
    maxWidth: '400px'
  },
  sectionFooter: {
    display: 'none'
  },
  input: {
    ...AmplifyTheme.input,
    fontSize: '16px'
  }
};

const reducer = combineReducers({
  auth: authReducer,
  alert: alertReducer,
  invitationAnswer: invitationAnswerReducer,
  form: reduxFormReducer
});

const store = configureStore({
  reducer: reducer,
  enhancers: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App theme={theme} />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorker.unregister();
