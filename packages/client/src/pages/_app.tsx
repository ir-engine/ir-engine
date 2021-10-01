// import { initGA, logPageView } from '@xrengine/client-core/src/common/components/analytics'
import { Config } from '@xrengine/common/src/config'
import { restoreState } from '@xrengine/client-core/src/persisted.store'
import { configureStore } from '@xrengine/client-core/src/store'
import GlobalStyle from '@xrengine/editor/src/components/GlobalStyle'
import theme from '@xrengine/editor/src/components/theme'
import React, { useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Provider, useDispatch } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import reducers from '../reducers'
import RouterComp from '../route/public'
import './styles.scss'

const App = (): any => {
  const dispatch = useDispatch()

  const initApp = useCallback(() => {
    if (process.env && process.env.NODE_CONFIG) {
      ;(window as any).env = process.env.NODE_CONFIG
    } else {
      ;(window as any).env = (window as any).env ?? ''
    }

    dispatch(restoreState())

    // initGA()

    // logPageView()
  }, [])

  useEffect(initApp, [])

  return (
    <>
      <Helmet>
        <title>{Config.publicRuntimeConfig.title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no"
        />
      </Helmet>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <RouterComp />
      </ThemeProvider>
    </>
  )
}

const StoreProvider = () => {
  return (
    <Provider store={configureStore(reducers)}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
}

export default StoreProvider
