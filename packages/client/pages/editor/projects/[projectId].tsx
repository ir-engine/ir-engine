import dynamic from "next/dynamic";
import React, { lazy, Suspense, useEffect, useState } from "react";
import NoSSR from "react-no-ssr";

const EditorContainer = dynamic(() => import("./../../../components/editor/EditorContainer"), { ssr: false });

import { connect } from 'react-redux';
import {selectAuthState} from "../../../redux/auth/selector";
import {bindActionCreators, Dispatch} from "redux";
import {doLoginAuto} from "../../../redux/auth/service";

interface Props {
    authState?: any;
    doLoginAuto?: typeof doLoginAuto;
}

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});

const Project = (props: Props) => {
    const {
        authState,
        doLoginAuto
    } = props;
    const authUser = authState.get('authUser');
    const user = authState.get('user');
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    useEffect(() => {
        doLoginAuto(true);
    }, []);
    return hasMounted && <Suspense fallback={React.Fragment}>
        <NoSSR>
            { authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null && <EditorContainer {...props} /> }
        </NoSSR>
    </Suspense>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);