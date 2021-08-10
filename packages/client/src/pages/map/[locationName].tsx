import { useTranslation } from 'react-i18next'
import UserMenu from '../../../../client-core/src/user/components/UserMenu'
import World from '../../components/World'
import MapMediaIconsBox from './MapMediaIconsBox'
import { FullscreenExit, ZoomOutMap } from '@material-ui/icons'
import { ThemeProvider } from '@material-ui/styles'
import { Alerts } from '@xrengine/client-core/src/common/components/Alerts'
import { UIDialog } from '@xrengine/client-core/src/common/components/Dialog/Dialog'
import NavMenu from '@xrengine/client-core/src/common/components/NavMenu'
import { setUserHasInteracted } from '@xrengine/client-core/src/common/reducers/app/actions'
import { selectAppOnBoardingStep, selectAppState } from '@xrengine/client-core/src/common/reducers/app/selector'
import { Config } from '@xrengine/client-core/src/helper'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { theme } from '@xrengine/client-core/src/theme'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { bindActionCreators, Dispatch } from 'redux'
import InstanceChat from '../../components/InstanceChat'
// @ts-ignore
import styles from './MapLayout.module.scss'
import instanceChatStyles from './MapInstanceChat.module.scss'

const siteTitle: string = Config.publicRuntimeConfig.siteTitle

interface Props {
  match?: any
  appState?: any
  authState?: any
  locationState?: any
  login?: boolean
  history?: any
  children?: any
  setUserHasInteracted?: any
  onBoardingStep?: number
}
const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    locationState: selectLocationState(state),
    onBoardingStep: selectAppOnBoardingStep(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setUserHasInteracted: bindActionCreators(setUserHasInteracted, dispatch)
})

const Layout = (props: Props): any => {
  const { t } = useTranslation()

  const path = useLocation().pathname
  const { appState, authState, setUserHasInteracted, login, locationState, onBoardingStep } = props
  const userHasInteracted = appState.get('userHasInteracted')
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false)
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const user = authState.get('user')
  const handle = useFullScreenHandle()

  const initialClickListener = () => {
    setUserHasInteracted()
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
  }

  useEffect(() => {
    if (userHasInteracted === false) {
      window.addEventListener('click', initialClickListener)
      window.addEventListener('touchend', initialClickListener)
    }
  }, [])

  const reportChange = useCallback((state) => {
    if (state) {
      setFullScreenActive(state)
    } else {
      setFullScreenActive(state)
    }
  }, [])

  return (
    <>
      <FullScreen handle={handle} onChange={reportChange}>
        <ThemeProvider theme={theme}>
          <section>
            <Helmet>
              <title>
                {siteTitle} | {t('location.locationName.pageTitle')}
              </title>
            </Helmet>
            <header>
              {path === '/login' && <NavMenu login={login} />}
            </header>

            {fullScreenActive ? (
              <button type="button" className={styles.fullScreen} onClick={handle.exit}>
                <FullscreenExit />
              </button>
            ) : (
              <button type="button" className={styles.fullScreen} onClick={handle.enter}>
                <ZoomOutMap />
              </button>
            )}
            <Fragment>
              <UIDialog />
              <Alerts />
              <World locationName={props.match.params.locationName} history={props.history} >
                <MapMediaIconsBox />
                <UserMenu />
              </World>
            </Fragment>
            <footer>
              {locationState.get('currentLocation')?.get('location')?.id &&
                authState.get('authUser') != null &&
                authState.get('isLoggedIn') === true &&
                user?.instanceId != null &&
                !bottomDrawerOpen && <InstanceChat styles={instanceChatStyles} setBottomDrawerOpen={setBottomDrawerOpen} />}
            </footer>
          </section>
        </ThemeProvider>
      </FullScreen>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout)
