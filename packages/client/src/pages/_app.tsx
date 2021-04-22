import React, { useCallback, useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Helmet } from "react-helmet";
import DeviceDetector from 'device-detector-js';
import { ThemeProvider } from "styled-components";
import { configureStore } from '@xr3ngine/client-core/src/store';
import { initGA, logPageView } from '@xr3ngine/client-core/src/common/components/analytics';
import Api from "@xr3ngine/client-core/src/world/components/editor/Api";
import { ApiContext } from '@xr3ngine/client-core/src/world/components/editor/contexts/ApiContext';
import GlobalStyle from '@xr3ngine/client-core/src/world/components/editor/GlobalStyle';
import theme from "@xr3ngine/client-core/src/world/components/editor/theme";
import { Config } from '@xr3ngine/client-core/src/helper';
import { getDeviceType } from '@xr3ngine/client-core/src/common/reducers/devicedetect/actions';
import { restoreState } from '@xr3ngine/client-core/src/persisted.store';
import RouterComp from '../router';
import './styles.scss';

const App = (): any => {
  const dispatch = useDispatch();
  const [api, setApi] = useState<Api>();

  const getDeviceInfo = async (): Promise<any> => {
    const deviceInfo = { device: {}, WebXRSupported: false };

    const deviceDetector = new DeviceDetector();

    deviceInfo.device = deviceDetector.parse(navigator.userAgent);

    if ((navigator as any).xr) {
      await (navigator as any).xr.isSessionSupported('immersive-vr').then(isSupported => {
        deviceInfo.WebXRSupported = isSupported;
        dispatch(getDeviceType(deviceInfo));
      });
    }
  };

  const initApp = useCallback(() => {
    dispatch(restoreState());

    initGA();

    logPageView();

    getDeviceInfo();

    setApi(new Api());
  }, []);

  useEffect(initApp, []);

  return (
    <>
      <Helmet>
        <title>{Config.publicRuntimeConfig.title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0', shrink-to-fit=no"
        />
      </Helmet>
      <ThemeProvider theme={theme}>
        <ApiContext.Provider value={api}>
          {/* <CssBaseline /> */}
          <GlobalStyle />
          <RouterComp />
        </ApiContext.Provider>
      </ThemeProvider>
    </>
  );
};

const StroreProvider = () => {
  return (
    <Provider store={configureStore()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
};

export default StroreProvider;
