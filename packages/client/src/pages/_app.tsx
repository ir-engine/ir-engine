import { initGA, logPageView } from '@xr3ngine/client-core/src/common/components/analytics';
import Api from "@xr3ngine/client-core/src/world/components/editor/Api";
import { ApiContext } from '@xr3ngine/client-core/src/world/components/editor/contexts/ApiContext';
import GlobalStyle from '@xr3ngine/client-core/src/world/components/editor/GlobalStyle';
import theme from "@xr3ngine/client-core/src/world/components/editor/theme";
import DeviceDetector from 'device-detector-js';
import { createWrapper } from 'next-redux-wrapper';
import { AppProps } from 'next/app';
import Head from 'next/head';
import querystring from 'querystring';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from "styled-components";
import url from 'url';
import './styles.scss';
import { configureStore } from '@xr3ngine/client-core/src/store';
import { dispatchAlertError } from '@xr3ngine/client-core/src/common/reducers/alert/service';
import { getDeviceType } from '@xr3ngine/client-core/src/common/reducers/devicedetect/actions';
import { restoreState } from '@xr3ngine/client-core/src/persisted.store';
import { initialize } from '../util';

import { Config } from '@xr3ngine/client-core/src/helper';

// Initialize i18n and client-core
initialize();
interface Props extends AppProps {}

const MyApp = (props: Props): any => {
  const { Component, pageProps } = props;
  const dispatch = useDispatch();

  const [api, setApi] = useState<Api>();
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
    dispatch(getDeviceType(deviceInfo));
  };
  const initApp = useCallback(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles?.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
    // NOTE: getDeviceInfo is an async function, but here is running
    // without `await`.

    dispatch(restoreState());
    initGA();
    logPageView();
    getDeviceInfo();
    const urlParts = url.parse(window.location.href);
    const query = querystring.parse(urlParts.query);
    if (query.error != null) {
      dispatch(dispatchAlertError(dispatch, query.error as string));
      delete query.error;
      const stringifiedQuery = querystring.stringify(query);
      window.history.replaceState(
        {},
        document.title,
        urlParts.pathname + stringifiedQuery
      );
    }
    setApi(new Api());
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(initApp, []);

  return (
    <Fragment>
      <Head>
        <title>{Config.publicRuntimeConfig.title}</title>
        <script src='/env-config.js' />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0', shrink-to-fit=no"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <ApiContext.Provider value={api}>
          {/* <CssBaseline /> */}
          <GlobalStyle />
          {isMounted && <Component {...pageProps} />}
        </ApiContext.Provider>
      </ThemeProvider>
    </Fragment>
  );
};

const wrapper = createWrapper(() => configureStore(), { debug: true });
export default wrapper.withRedux(MyApp);
