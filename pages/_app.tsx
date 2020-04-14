import App from 'next/app';
import Head from 'next/head';
import { AppProps } from 'next/app';
import React, { Fragment } from 'react';
import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { configureStore } from '../redux/store'
import { Store } from 'redux';
import { ThemeProvider } from '@material-ui/core/styles';
import { siteTitle } from "../config/server";
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../components/assets/theme';

interface Props extends AppProps{
    store: Store;
}

class MyApp extends App<Props> {
  componentDidMount() {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles && jssStyles.parentNode)
      jssStyles.parentNode.removeChild(jssStyles)
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
        <Fragment>
          <Head>
            <title>{ siteTitle }</title>
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
          </Head>
          <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Provider store={store}>
              <Component {...pageProps} />
            </Provider>
          </ThemeProvider>
        </Fragment>
    );
  }
}


export default withRedux(configureStore, {
  serializeState: (state) => state.toJS(),
  deserializeState: (state) => fromJS(state),
})(MyApp);
