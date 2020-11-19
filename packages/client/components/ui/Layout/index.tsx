import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import getConfig from 'next/config';
import NavMenu from '../NavMenu';
import Head from 'next/head';
import Alerts from '../Common/Alerts';
import UIDialog from '../Dialog/Dialog';
import DrawerControls from '../DrawerControls';
import LeftDrawer from '../Drawer/Left';
import RightDrawer from '../Drawer/Right';
import BottomDrawer from '../Drawer/Bottom';
import { selectAuthState } from '../../../redux/auth/selector';
import { selectLocationState } from '../../../redux/location/selector';
import PartyVideoWindows from '../PartyVideoWindows';
import InstanceChat from '../InstanceChat';
import Me from '../Me';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { useRouter } from 'next/router';

const { publicRuntimeConfig } = getConfig();
const siteTitle: string = publicRuntimeConfig.siteTitle;

interface Props {
  authState?: any;
  locationState?: any;
  login?: boolean;
  pageTitle: string;
  children?: any;
}
const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    locationState: selectLocationState(state)
  };
};

const mapDispatchToProps = (): any => ({});

const Layout = (props: Props): any => {
  const path = useRouter().pathname;
  const { pageTitle, children, authState, locationState, login } = props;
  const authUser = authState.get('authUser');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [topDrawerOpen, setTopDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const user = authState.get('user');
  //info about current mode to conditional render menus
// TODO: Uncomment alerts when we can fix issues
  return (
    <section>
      <Head>
        <title>
          {siteTitle} | {pageTitle}
        </title>
      </Head>
      <header>
        { path === '/login' && <NavMenu login={login} />}
        {<PartyVideoWindows />}
      </header>
      <Fragment>
        <UIDialog />
         <Alerts />
        {children}
      </Fragment>
      { authUser?.accessToken != null && authUser.accessToken.length > 0 &&
                <Fragment>
                  <LeftDrawer leftDrawerOpen={leftDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen}/>
                </Fragment>
      }
      { authUser?.accessToken != null && authUser.accessToken.length > 0 &&
      <Fragment>
        <RightDrawer rightDrawerOpen={rightDrawerOpen} setRightDrawerOpen={setRightDrawerOpen}/>
      </Fragment>
      }
      { authUser?.accessToken != null && authUser.accessToken.length > 0 &&
                <Fragment>
                  <BottomDrawer bottomDrawerOpen={bottomDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen}/>
                </Fragment>
      }
      <footer>
        { authState.get('authUser') != null && authState.get('isLoggedIn') === true && !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen &&
                <DrawerControls setLeftDrawerOpen={setLeftDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen} setTopDrawerOpen={setTopDrawerOpen} setRightDrawerOpen={setRightDrawerOpen}/> }
        { authUser?.accessToken != null && authUser.accessToken.length > 0 && <Me /> }


        {console.log('authState', authState, 'user', user, 'leftDrawerOpen',leftDrawerOpen, 'rightDrawerOpen',rightDrawerOpen, 'topDrawerOpen',topDrawerOpen, 'bottomDrawerOpen',bottomDrawerOpen)}
        { authState.get('authUser') != null && authState.get('isLoggedIn') === true &&  user.instanceId != null && !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen &&
        // { authState.get('authUser') != null && authState.get('isLoggedIn') === true && user.partyId != null && user.instanceId != null && !leftDrawerOpen && !rightDrawerOpen && !topDrawerOpen && !bottomDrawerOpen &&
          <InstanceChat setBottomDrawerOpen={setBottomDrawerOpen}/> }
      </footer>
    </section>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
