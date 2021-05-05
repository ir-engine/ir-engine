import React, { useEffect } from 'react';
import Dashboard  from "@xrengine/client-core/src/user/components/Dashboard/Dashboard";
import { bindActionCreators, Dispatch } from "redux";
import InstanceConsole from "@xrengine/client-core/src/admin/components/InstanceConsole";
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service';
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

 function Instance( props: Props) {
    const { doLoginAuto } = props;     
    useEffect(() => {
       doLoginAuto(true);
    }, []); 
    return (
        <Dashboard>
           <InstanceConsole/>
        </Dashboard>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Instance);