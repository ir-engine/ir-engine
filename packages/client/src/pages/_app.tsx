import { initGA, logPageView } from '@xrengine/client-core/src/common/components/analytics'
import { Config } from '@xrengine/common/src/config'
import { AuthAction } from '@xrengine/client-core/src/user/state/AuthService'
import GlobalStyle from '@xrengine/client-core/src/util/GlobalStyle'
import theme from '@xrengine/client-core/src/util/theme'
import React, { useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch } from '@xrengine/client-core/src/store'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
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

    dispatch(AuthAction.restoreAuth())

    initGA()

    logPageView()
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

const AppPage = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default AppPage
