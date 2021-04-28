import React, { useEffect } from 'react';
import { bindActionCreators, Dispatch } from "redux";
import InstanceConsole from "@xr3ngine/client-core/src/admin/components/InstanceConsole";
import { doLoginAuto } from '@xr3ngine/client-core/src/user/reducers/auth/service';
import { connect } from 'react-redux';

interface Props {
    doLoginAuto?: any;
}

const mapStateToProps = (state: any): any => {
    return {
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});

function Instance(props: Props) {
    const { doLoginAuto } = props;
    useEffect(() => {
        doLoginAuto(true);
    }, []);
    return (
        <InstanceConsole />
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Instance);