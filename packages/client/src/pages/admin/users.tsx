import React, { useEffect } from 'react';
import { bindActionCreators, Dispatch } from "redux";
import Dashboard  from "@xrengine/client-core/src/user/components/Dashboard/Dashboard";
import UserConsole from "@xrengine/client-core/src/admin/components/UserConsole";
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

 function users( props: Props) {
   const { doLoginAuto } = props;     
   useEffect(() => {
      doLoginAuto(true);
   }, []); 
    return (
        <Dashboard>
             <UserConsole/>
        </Dashboard>
    );
}


export default connect(mapStateToProps, mapDispatchToProps)(users);