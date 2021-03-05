import {ThemeProvider} from '@material-ui/core';
import getConfig from 'next/config';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {setUserHasInteracted} from '../../../redux/app/actions';
import {selectAppOnBoardingStep, selectAppState} from '../../../redux/app/selector';
import {selectAuthState} from '../../../redux/auth/selector';
import {selectLocationState} from '../../../redux/location/selector';
import theme from '../../../theme';
import {Alerts} from '../Common/Alerts';
import {UIDialog} from '../Dialog/Dialog';
import BottomDrawer from '../Drawer/Bottom';
import LeftDrawer from '../Drawer/Left/LeftDrawer';
import RightDrawer from '../Drawer/Right';
import DrawerControls from '../DrawerControls';
import InstanceChat from '../InstanceChat';
import Me from '../Me';
import NavMenu from '../NavMenu';
import PartyVideoWindows from '../PartyVideoWindows';
import Harmony from "../Harmony";
import {doLoginAuto} from '@xr3ngine/client-core/redux/auth/service';
import {client} from "../../../redux/feathers";
import {NetworkSchema} from "@xr3ngine/engine/src/networking/interfaces/NetworkSchema";
import {DefaultNetworkSchema} from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import {SocketWebRTCClientTransport} from "@xr3ngine/engine/src/networking/classes/SocketWebRTCClientTransport";
import {styleCanvas} from "@xr3ngine/engine/src/renderer/functions/styleCanvas";
import {EngineProxy} from "@xr3ngine/engine/src/EngineProxy";

const {publicRuntimeConfig} = getConfig();
const siteTitle: string = publicRuntimeConfig.siteTitle;

const initialSelectedUserState = {
    id: '',
    name: '',
    userRole: '',
    identityProviders: [],
    relationType: {},
    inverseRelationType: {},
    avatarUrl: ''
};

const initialGroupForm = {
    id: '',
    name: '',
    groupUsers: [],
    description: ''
};

interface Props {
    appState?: any;
    authState?: any;
    locationState?: any;
    login?: boolean;
    pageTitle: string;
    children?: any;
    setUserHasInteracted?: any;
    onBoardingStep?: number;
    doLoginAuto?: typeof doLoginAuto;
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
    setUserHasInteracted: bindActionCreators(setUserHasInteracted, dispatch),
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
});

const Layout = (props: Props): any => {
    const path = useRouter().pathname;
    const {
        pageTitle,
        children,
        appState,
        authState,
        setUserHasInteracted,
        doLoginAuto,
        locationState,
    } = props;
    const userHasInteracted = appState.get('userHasInteracted');
    const authUser = authState.get('authUser');
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
    const [harmonyOpen, setHarmonyOpen] = useState(false);
    const [fullScreenActive, setFullScreenActive] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [detailsType, setDetailsType] = useState('');
    const [groupFormOpen, setGroupFormOpen] = useState(false);
    const [groupFormMode, setGroupFormMode] = useState('');
    const [groupForm, setGroupForm] = useState(initialGroupForm);
    const [selectedUser, setSelectedUser] = useState(initialSelectedUserState);
    const [selectedGroup, setSelectedGroup] = useState(initialGroupForm);
    const user = authState.get('user');

    const childrenWithProps = React.Children.map(children, child => {
        // checking isValidElement is the safe way and avoids a typescript error too
        if (React.isValidElement(child)) {
            const mapped = React.Children.map((child as any).props.children, child => {
                if (React.isValidElement(child)) { // @ts-ignore
                    return React.cloneElement(child, {harmonyOpen: harmonyOpen});
                }
            });
            return mapped;
        }
        return child;
    });

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

        doLoginAuto(true);
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
                <Harmony
                    isHarmonyPage={true}
                    setHarmonyOpen={setHarmonyOpen}
                    detailsType={detailsType}
                    setDetailsType={setDetailsType}
                    groupFormOpen={groupFormOpen}
                    setGroupFormOpen={setGroupFormOpen}
                    groupFormMode={groupFormMode}
                    setGroupFormMode={setGroupFormMode}
                    groupForm={groupForm}
                    setGroupForm={setGroupForm}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    setLeftDrawerOpen={setLeftDrawerOpen}
                    setBottomDrawerOpen={setBottomDrawerOpen}
                    setRightDrawerOpen={setRightDrawerOpen}
                />
                <Fragment>
                    <UIDialog/>
                    <Alerts/>
                    {childrenWithProps}
                </Fragment>
                {authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
                <Fragment>
                    <LeftDrawer
                        harmony={true}
                        detailsType={detailsType}
                        setDetailsType={setDetailsType}
                        groupFormOpen={groupFormOpen}
                        setGroupFormOpen={setGroupFormOpen}
                        groupFormMode={groupFormMode}
                        setGroupFormMode={setGroupFormMode}
                        groupForm={groupForm}
                        setGroupForm={setGroupForm}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                        selectedGroup={selectedGroup}
                        setSelectedGroup={setSelectedGroup}
                        openBottomDrawer={bottomDrawerOpen}
                        leftDrawerOpen={leftDrawerOpen}
                        setLeftDrawerOpen={setLeftDrawerOpen}
                        setRightDrawerOpen={setRightDrawerOpen}
                        setBottomDrawerOpen={setBottomDrawerOpen}/>
                </Fragment>
                }
                {authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null &&
                <Fragment>
                    <RightDrawer rightDrawerOpen={rightDrawerOpen} setRightDrawerOpen={setRightDrawerOpen}/>
                </Fragment>
                }
            </section>
        </ThemeProvider>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
