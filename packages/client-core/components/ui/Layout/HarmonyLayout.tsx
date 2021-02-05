import { ThemeProvider } from '@material-ui/core';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useState } from 'react';
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
  const user = authState.get('user');

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

  //info about current mode to conditional render menus
// TODO: Uncomment alerts when we can fix issues
  return (
    <ThemeProvider theme={theme}>
    <section>
      <Head>
        <title>
          {siteTitle} | {pageTitle}
        </title>
      </Head>
      <header>
        { path === '/login' && <NavMenu login={login} />}
      </header>
      <Fragment>
        <UIDialog />
         <Alerts />
        {children}
      </Fragment>
      { authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
        <Fragment>
          <LeftDrawer openBottomDrawer={true} leftDrawerOpen={leftDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen}/>
        </Fragment>
      }
      { authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
        <Fragment>
          <RightDrawer rightDrawerOpen={rightDrawerOpen} setRightDrawerOpen={setRightDrawerOpen}/>
        </Fragment>
      }
      { authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
        <Fragment>
          <BottomDrawer bottomDrawerOpen={bottomDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen}/>
        </Fragment>
      }
      <footer>
        { authState.get('authUser') != null && authState.get('isLoggedIn') === true && user?.id != null && !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen &&
            <DrawerControls disableBottom={true} setLeftDrawerOpen={setLeftDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} setTopDrawerOpen={setTopDrawerOpen} setRightDrawerOpen={setRightDrawerOpen}/> }

        { locationState.get('currentLocation')?.get('location')?.id && 
          authState.get('authUser') != null && authState.get('isLoggedIn') === true &&  user?.instanceId != null &&
           !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen && 
            <InstanceChat setBottomDrawerOpen={setBottomDrawerOpen}/> }
      </footer>
    </section>
    </ThemeProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
