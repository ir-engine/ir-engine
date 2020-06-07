// eslint-disable-next-line
import App, { AppProps } from 'next/app'
import Head from 'next/head'
import withRedux from 'next-redux-wrapper'
import { Provider } from 'react-redux'
import { fromJS } from 'immutable'
import { configureStore } from '../redux/store'
import { Store } from 'redux'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from '../components/assets/theme'
import { restoreState } from '../redux/persisted.store'
import { doLoginAuto } from '../redux/auth/service'
import DeviceDetector from 'device-detector-js'
import { getDeviceType } from '../redux/devicedetect/actions'
import { useEffect, Fragment } from 'react'
import { initGA, logPageView } from '../components/analytics'

import getConfig from 'next/config'
import PageLoader from '../components/xr/scene/page-loader'

const config = getConfig().publicRuntimeConfig

interface Props extends AppProps {
  store: Store
}

const MyApp = (props: Props) => {
  const { Component, pageProps, store } = props

  const getDeviceInfo = async () => {
    const deviceInfo = { device: {}, WebXRSupported: false }
    const deviceDetector = new DeviceDetector()
    const userAgent = navigator.userAgent
    deviceInfo.device = deviceDetector.parse(userAgent)
    // @ts-ignore
    if (navigator.xr === undefined) {
      deviceInfo.WebXRSupported = false
    } else {
      // @ts-ignore
      deviceInfo.WebXRSupported = await navigator.xr.isSessionSupported('immersive-vr')
    }
    store.dispatch(getDeviceType(deviceInfo))
  }

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles)
    }
    // NOTE: getDeviceInfo is an async function, but here is running
    // without `await`.
    initGA()
    logPageView()
    getDeviceInfo()
    store.dispatch(restoreState())
    doLoginAuto(store.dispatch)
  }, [])

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
        <CssBaseline />
        <Provider store={store}>
          <PageLoader Component={Component} pageProps={pageProps} />
        </Provider>
      </ThemeProvider>
    </Fragment>
  )
}
export default withRedux(configureStore, {
  serializeState: (state) => state.toJS(),
  deserializeState: (state) => fromJS(state)
})(MyApp)
