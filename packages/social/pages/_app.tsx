import { initGA, logPageView } from '@xr3ngine/client-core/components/analytics';
import GlobalStyle from '@xr3ngine/client-core/components/editor/GlobalStyle';
import theme from "../theme";
import { dispatchAlertError } from '@xr3ngine/client-core/redux/alert/service';
import { getDeviceType } from '@xr3ngine/client-core/redux/devicedetect/actions';
import { restoreState } from '@xr3ngine/client-core/redux/persisted.store';
import { configureStore } from '@xr3ngine/client-core/redux/store';
import DeviceDetector from 'device-detector-js';
import { fromJS } from 'immutable';
import withRedux from 'next-redux-wrapper';
import { AppProps } from 'next/app';
import getConfig from 'next/config';
import Head from 'next/head';
import querystring from 'querystring';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { connect, Provider } from 'react-redux';
import { Dispatch, Store } from 'redux';
import url from 'url';
import './styles.scss';
import { ThemeProvider } from '@material-ui/core';


const config = getConfig().publicRuntimeConfig;

interface Props extends AppProps {
  store: Store;
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

  const pwaHeadMeta = !process.env.BUILD_PWA? null : (<>
      <link rel="manifest" href="/manifest.json"/>
      <meta name='application-name' content='ARC App'/>
      <meta name='apple-mobile-web-app-capable' content='yes'/>
      <meta name='apple-mobile-web-app-status-bar-style' content='default'/>
      <meta name='apple-mobile-web-app-title' content='PWA App'/>
      <meta name='description' content='Best PWA App in the world'/>
      <meta name='format-detection' content='telephone=no'/>
      <meta name='mobile-web-app-capable' content='yes'/>
      <meta name='msapplication-config' content='/static/icons/browserconfig.xml'/>
      <meta name='msapplication-TileColor' content='#2B5797'/>
      <meta name='msapplication-tap-highlight' content='no'/>
      <meta name='theme-color' content='#000000'/>

      <link rel='apple-touch-icon' sizes='180x180' href='/static/icons/apple-touch-icon.png'/>
      <link rel='icon' type='image/png' sizes='32x32' href='/static/icons/favicon-32x32.png'/>
      <link rel='icon' type='image/png' sizes='16x16' href='/static/icons/favicon-16x16.png'/>
      <link rel='mask-icon' href='/static/icons/safari-pinned-tab.svg' color='#5bbad5'/>
      <link rel='shortcut icon' href='/static/icons/favicon.ico'/>
      <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500'/>

      <meta name='twitter:card' content='summary'/>
      <meta name='twitter:url' content='https://arc-app.com'/>
      <meta name='twitter:title' content='ARC App'/>
      <meta name='twitter:description' content='Best PWA App in the world'/>
      <meta name='twitter:image' content='https://yourdomain.com/static/icons/android-chrome-192x192.png'/>
      <meta name='twitter:creator' content='@DavidWShadow'/>
      <meta property='og:type' content='website'/>
      <meta property='og:title' content='PWA App'/>
      <meta property='og:description' content='Best PWA App in the world'/>
      <meta property='og:site_name' content='PWA App'/>
      <meta property='og:url' content='https://yourdomain.com'/>
      <meta property='og:image' content='https://yourdomain.com/static/icons/apple-touch-icon.png'/>
    </>
  );

  return (
    <Fragment>
      <Head>
        <title>{config.title}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        {pwaHeadMeta}
      </Head>
      <ThemeProvider theme={theme}>
          {/* <CssBaseline /> */}
          {/* <GlobalStyle /> */}
          <Provider store={store}>
            {isMounted && <Component {...pageProps} />}
          </Provider>
      </ThemeProvider>
    </Fragment>
  );
};
export default withRedux(configureStore, {
  serializeState: (state) => state.toJS(),
  deserializeState: (state) => fromJS(state)
})(connect(mapStateToProps, mapDispatchToProps)(MyApp));
