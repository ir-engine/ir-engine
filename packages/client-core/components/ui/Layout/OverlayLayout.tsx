import { Fab, ThemeProvider} from '@material-ui/core';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { setUserHasInteracted } from '../../../redux/app/actions';
import { selectAppOnBoardingStep, selectAppState } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { selectLocationState } from '../../../redux/location/selector';
import theme from '../../../theme';
import { Alerts } from '../Common/Alerts';
import { UIDialog } from '../Dialog/Dialog';
import BottomDrawer from '../Drawer/Bottom';
import LeftDrawer from '../Drawer/Left/LeftDrawer';
import RightDrawer from '../Drawer/Right';
import DrawerControls from '../DrawerControls';
import InstanceChat from '../InstanceChat';
import Me from '../Me';
import NavMenu from '../NavMenu';
import PartyVideoWindows from '../PartyVideoWindows';
import {
    Forum
} from '@material-ui/icons';
import {  FullscreenExit} from "@material-ui/icons";
import Harmony from "../Harmony";
//@ts-ignore
import styles from './Layout.module.scss';
import { Toast } from "../Toast/Toast";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Expand } from '../Icons/Expand';

const { publicRuntimeConfig } = getConfig();
const siteTitle: string = publicRuntimeConfig.siteTitle;

interface Props {
  appState?: any;
  authState?: any;
  locationState?: any;
  login?: boolean;
  pageTitle: string;
  children?: any;
  setUserHasInteracted?: any;
  onBoardingStep?: number;
}
const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    locationState: selectLocationState(state),
    onBoardingStep: selectAppOnBoardingStep(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setUserHasInteracted: bindActionCreators(setUserHasInteracted, dispatch)
});

const Layout = (props: Props): any => {
  const path = useRouter().pathname;
  const {
    pageTitle,
    children,
    appState,
    authState,
    setUserHasInteracted,
    login,
    locationState,
    onBoardingStep
  } = props;
  const userHasInteracted = appState.get('userHasInteracted');
  const authUser = authState.get('authUser');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [topDrawerOpen, setTopDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [harmonyOpen, setHarmonyOpen] = useState(false);
  const [fullScreenActive, setFullScreenActive] = useState(false);
  const user = authState.get('user');
  const handle = useFullScreenHandle();

  const initialClickListener = () => {
    setUserHasInteracted();
    window.removeEventListener('click', initialClickListener);
    window.removeEventListener('touchend', initialClickListener);
  };

  useEffect(() => {
    if (userHasInteracted === false) {
      window.addEventListener('click', initialClickListener);
      window.addEventListener('touchend', initialClickListener);
    }
  }, []);


  const childrenWithProps = React.Children.map(children, child => {
    // checking isValidElement is the safe way and avoids a typescript error too
    if (React.isValidElement(child)) {
      const mapped = React.Children.map((child as any).props.children, child => {
        if (React.isValidElement(child)) { // @ts-ignore
          return React.cloneElement(child, { harmonyOpen: harmonyOpen });
        }
      });
      return mapped;
    }
    return child;
  });
  const reportChange = useCallback((state) => {
    if (state) {
      setFullScreenActive(state);
    } else {
      setFullScreenActive(state);
    }
  }, []);

  //info about current mode to conditional render menus
  // TODO: Uncomment alerts when we can fix issues
  return (
    <>
      {
        !fullScreenActive && <span className={styles.fullScreen} onClick={handle.enter}>
          <Expand/>
        </span>
      }
      <FullScreen handle={handle} onChange={reportChange}>
        <ThemeProvider theme={theme}>
          <section>
            <Head>
              <title>
                {siteTitle} | {pageTitle}
              </title>
            </Head>
            <header>
              {path === '/login' && <NavMenu login={login} />}
              { harmonyOpen !== true 
                ? (
                  <section className={styles.locationUserMenu}>
                    {authUser?.accessToken != null && authUser.accessToken.length > 0 && <Me /> }
                    <PartyVideoWindows />
                  </section>
                ) : null}
            </header>

            {harmonyOpen === true && <Harmony setLeftDrawerOpen={setLeftDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} />}
            <Fragment>
              <UIDialog />
              <Alerts />
              {childrenWithProps}
            </Fragment>
            {authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
              <Fragment>
                <LeftDrawer harmony={true} setHarmonyOpen={setHarmonyOpen} openBottomDrawer={bottomDrawerOpen} leftDrawerOpen={leftDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} />
              </Fragment>
            }
            {authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
              <Fragment>
                <RightDrawer rightDrawerOpen={rightDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} />
              </Fragment>
            }
            {authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
              <Fragment>
                <BottomDrawer bottomDrawerOpen={bottomDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen} />
              </Fragment>
            }
            <footer>
              {authState.get('authUser') != null && authState.get('isLoggedIn') === true && user?.id != null && user?.userRole !== 'guest' && !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen &&
                <DrawerControls disableBottom={true} setLeftDrawerOpen={setLeftDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} setTopDrawerOpen={setTopDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} />}

              {locationState.get('currentLocation')?.get('location')?.id &&
                authState.get('authUser') != null && authState.get('isLoggedIn') === true && user?.instanceId != null &&
                !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen &&
                <InstanceChat setBottomDrawerOpen={setBottomDrawerOpen} />}
              { user?.userRole !== 'guest' && <div className={styles['harmony-toggle']}><Fab color="primary" onClick={() => setHarmonyOpen(!harmonyOpen )}><Forum /></Fab></div> }


              {
                fullScreenActive && <span className={styles.fullScreen} onClick={handle.exit}>
                  <FullscreenExit style={{ fontSize: "4rem" }} />
                </span>
              }

              {// use this Module when you want toast message and pass type of alter you want 
              }
              {/*<Toast message="this is a success message!" status="success" />*/}
              {/* <Toast message="this is an error message!" status="error"/> */}
              {/* <Toast message="this is a warning message!" status="warning"/> */}
            </footer>
          </section>
        </ThemeProvider>
      </FullScreen>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
