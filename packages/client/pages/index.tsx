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
    authState?: any
    partyState?: any;
    doLoginAuto?: any;
    connectToInstanceServer?: any;
    instanceConnectionState?: any;
    provisionInstanceServer?: any;
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

export const IndexPage = (props: Props): any => {
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
    const party = partyState.get('party');
    const instanceId = selfUser?.instanceId != null ? selfUser.instanceId : party?.instanceId != null ? party.instanceId : null;
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
