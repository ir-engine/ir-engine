import GlobalStyle from '@standardcreative/client-core/src/util/GlobalStyle'
import React, { useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch } from '@standardcreative/client-core/src/store'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import theme from '../../theme'
import './styles.scss'
import { AuthAction } from '@standardcreative/client-core/src/user/state/AuthAction'
import RouterComp from '../router'

const App = (): any => {
  const dispatch = useDispatch()

  const initApp = useCallback(() => {
    if (process.env && process.env.NODE_CONFIG) {
      ;(window as any).env = process.env.NODE_CONFIG
    } else {
      ;(window as any).env = ''
    }

    dispatch(AuthAction.restoreAuth())

    // initGA()

    // logPageView()
  }, [])

  useEffect(initApp, [])

  return (
    <>
      <Helmet>
        <title>CREATOR</title>
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
