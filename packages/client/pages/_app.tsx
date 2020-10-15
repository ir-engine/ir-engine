// eslint-disable-next-line
import App, { AppProps } from 'next/app'
import Head from 'next/head';
import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { configureStore } from '../redux/store';
import {bindActionCreators, Dispatch, Store} from 'redux';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from "./../components/editor/theme";
import { ThemeProvider } from "styled-components";
import { restoreState } from '../redux/persisted.store';
import { doLoginAuto } from '../redux/auth/service';
import DeviceDetector from 'device-detector-js';
import { getDeviceType } from '../redux/devicedetect/actions';
import React, { useEffect, Fragment, useState } from 'react';
import { initGA, logPageView } from '../components/analytics';
import url from 'url';
import querystring from 'querystring';
import { dispatchAlertError } from '../redux/alert/service';
import { connect } from 'react-redux';

import getConfig from 'next/config';
import { ApiContext } from '../components/editor/contexts/ApiContext';
import Api from "../components/editor/api/Api";

const config = getConfig().publicRuntimeConfig;



interface Props extends AppProps {
  store: Store;
  doLoginAuto: typeof doLoginAuto;
}


const mapStateToProps = (state: any): any => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});

const MyApp = (props: Props): any => {
  const { Component, pageProps, store, doLoginAuto } = props;

  const [api, setApi] = useState<Api>();

  const getDeviceInfo = async (): Promise<any> => {
    const deviceInfo = { device: {}, WebXRSupported: false };
    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    deviceInfo.device = deviceDetector.parse(userAgent);
    if ((navigator as any).xr === undefined) {
      deviceInfo.WebXRSupported = false;
    } else {
      deviceInfo.WebXRSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
    }
    store.dispatch(getDeviceType(deviceInfo));
  };

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles?.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
    // NOTE: getDeviceInfo is an async function, but here is running
    // without `await`.
    store.dispatch(restoreState());
    initGA();
    logPageView();
    getDeviceInfo();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    doLoginAuto();
    const urlParts = url.parse(window.location.href);
    const query = querystring.parse(urlParts.query);
    if (query.error != null) {
      store.dispatch(dispatchAlertError(store.dispatch, (query.error as string)));
      delete query.error;
      const stringifiedQuery = querystring.stringify(query);
      window.history.replaceState({}, document.title, urlParts.pathname + stringifiedQuery);
    }
    setApi(new Api());
  }, []);

  return (
    <Fragment>
      <Head>
        <title>{config.title}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <ApiContext.Provider value={api}>
          <CssBaseline />
          <Provider store={store}>
            <Component {...pageProps} />
          </Provider>
        </ApiContext.Provider>
      </ThemeProvider>
    </Fragment>
  );
};

MyApp.getInitialProps = async(ctx) => {
  return {}
}

export default withRedux(configureStore, {
  serializeState: (state) => state.toJS(),
  deserializeState: (state) => fromJS(state)
})(connect(mapStateToProps, mapDispatchToProps)(MyApp));
