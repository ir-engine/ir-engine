import React, { useCallback, useEffect, useState } from 'react'
import { Dispatch } from 'redux'
import { Provider, useDispatch } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ThemeProvider } from 'styled-components'
import { configureStore } from '@xrengine/client-core/src/store'
import { initGA, logPageView } from '@xrengine/client-core/src/common/components/analytics'
import Api from '@xrengine/client-core/src/world/components/editor/Api'
import { ApiContext } from '@xrengine/client-core/src/world/components/editor/contexts/ApiContext'
import GlobalStyle from '@xrengine/client-core/src/world/components/editor/GlobalStyle'
import theme from '@xrengine/client-core/src/world/components/editor/theme'
import { Config } from '@xrengine/client-core/src/helper'
import { restoreState } from '@xrengine/client-core/src/persisted.store'
import RouterComp from '../route/public'
import reducers from '../reducers'
import './styles.scss'

const App = (): any => {
  const dispatch = useDispatch()
  const [api, setApi] = useState<Api>()

  const initApp = useCallback(() => {
    if (process.env && process.env.NODE_CONFIG) {
      ;(window as any).env = process.env.NODE_CONFIG
    } else {
      ;(window as any).env = (window as any).env ?? ''
    }

    dispatch(restoreState())

    initGA()

    logPageView()

    setApi(new Api())
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
        <ApiContext.Provider value={api}>
          {/* <CssBaseline /> */}
          <GlobalStyle />
          <RouterComp />
        </ApiContext.Provider>
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
