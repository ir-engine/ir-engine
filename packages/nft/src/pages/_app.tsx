import { initGA, logPageView } from '@xr3ngine/client-core/src/common/components/analytics';
import { dispatchAlertError } from '@xr3ngine/client-core/src/common/reducers/alert/service';
import { getDeviceType } from '@xr3ngine/client-core/src/common/reducers/devicedetect/actions';
import { restoreState } from '@xr3ngine/client-core/src/persisted.store';
import { configureStore } from '@xr3ngine/client-core/src/store';
import DeviceDetector from 'device-detector-js';
import { fromJS } from 'immutable';
import withRedux from 'next-redux-wrapper';
import { AppProps } from 'next/app';
import getConfig from 'next/config';
import Head from 'next/head';
import querystring from 'querystring';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, Provider } from 'react-redux';
import { Dispatch, Store } from 'redux';
import url from 'url';
import { StateProvider } from '../state';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

const config = getConfig().publicRuntimeConfig;

interface Props extends AppProps {
  store: Store;
}
function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const mapStateToProps = (state: any): any => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});

const MyApp = (props: Props): any => {
  const { Component, pageProps, store } = props;

  // State that is used to render the page component if this one is mounted on client side.
  const [isMounted, setIsMounted] = useState(false);

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

  const initApp = useCallback(() => {
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
    const urlParts = url.parse(window.location.href);
    const query = querystring.parse(urlParts.query);
    if (query.error != null) {
      store.dispatch(dispatchAlertError(store.dispatch, query.error as string));
      delete query.error;
      const stringifiedQuery = querystring.stringify(query);
      window.history.replaceState(
        {},
        document.title,
        urlParts.pathname + stringifiedQuery
      );
    }
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(initApp, []);

  return (
    <StateProvider>
            <Web3ReactProvider getLibrary={getLibrary}>

      <Head>
        <title>{config.title}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Provider store={store}>
        {isMounted && <Component {...pageProps} />}
      </Provider>
      </Web3ReactProvider>

    </StateProvider>
  );
};
export default withRedux(configureStore, {
  serializeState: (state) => state.toJS(),
  deserializeState: (state) => fromJS(state)
})(connect(mapStateToProps, mapDispatchToProps)(MyApp));
