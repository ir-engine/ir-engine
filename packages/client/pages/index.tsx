import React, {useEffect} from 'react';
import NoSSR from 'react-no-ssr';
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";
import Loading from '../components/scenes/loading';
import Scene from "../components/scenes/scene";
import Layout from '../components/ui/Layout';
import {selectAppState} from '../redux/app/selector';
import {selectAuthState} from "../redux/auth/selector";
import {doLoginAuto} from '../redux/auth/service';
import {selectInstanceConnectionState} from '../redux/instanceConnection/selector';
import {client} from "../redux/feathers";
import {connectToInstanceServer, provisionInstanceServer} from "../redux/instanceConnection/service";
import {selectPartyState} from "../redux/party/selector";

interface Props {
    appState?: any;
    authState?: any;
    instanceConnectionState?: any;
    connectToInstanceServer?: any;
    provisionInstanceServer?: any;
    doLoginAuto?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        instanceConnectionState: selectInstanceConnectionState(state),
        partyState: selectPartyState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
    connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch),
    provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch)
});

export const IndexPage = (props: any): any => {
    const {
        appState,
        authState,
        instanceConnectionState,
        partyState,
        connectToInstanceServer,
        provisionInstanceServer,
        doLoginAuto
    } = props;
    const selfUser = authState.get('user');
    console.log("SelfUser:")
    console.log(selfUser)
    const party = partyState.get('party');
    console.log("party:")
    console.log(party)
    const instanceId = selfUser.instanceId != null ? selfUser.instanceId : party?.instanceId != null ? party.instanceId : null;
    const appLoaded = appState.get('loaded');

    useEffect(() => {
        doLoginAuto(true);
    }, []);

    useEffect(() => {
        if (
            instanceConnectionState.get('instanceProvisioned') === true &&
            instanceConnectionState.get('updateNeeded') === true &&
            instanceConnectionState.get('instanceServerConnecting') === false &&
            instanceConnectionState.get('connected') === false
        ) {
            console.log('Calling connectToInstanceServer from index page');
            connectToInstanceServer();
        } else {
            console.log("Couldn't call connectToInstance Server");
            console.log(instanceConnectionState.get('instanceProvisioned'));
            console.log(instanceConnectionState.get('updateNeeded'));
            console.log(instanceConnectionState.get('instanceServerConnecting'));
            console.log(instanceConnectionState.get('connected'));
        }
    }, [instanceConnectionState]);

    useEffect(() => {
        if (appLoaded === true && instanceConnectionState.get('instanceProvisioned') === false && instanceConnectionState.get('instanceProvisioning') === false) {
            if (instanceId != null) {
                client.service('instance').get(instanceId)
                    .then((instance) => {
                        console.log('Provisioning instance from index page init useEffect');
                        provisionInstanceServer(instance.locationId);
                    });
            } else {
                console.error("instanceId is null");
            }
        }
    }, [appState]);

    // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

    return (
        <Layout pageTitle="Home" login={false}>
            <NoSSR onSSR={<Loading/>}>
                <Scene/>
            </NoSSR>
        </Layout>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
