import React, { useEffect } from 'react';
import { bindActionCreators, Dispatch } from "redux";
import Dashboard from "@xr3ngine/client-core/components/ui/Layout/Dashboard";
import UserConsole from "@xr3ngine/client-core/components/ui/Admin/UserConsole"
import { doLoginAuto } from '@xr3ngine/client-core/redux/auth/service';
import { connect } from 'react-redux';

interface Props {
    doLoginAuto?: any;
}

const mapStateToProps = (state: any): any => {
    return {
    };
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});

 function users( props: Props) {
   const { doLoginAuto } = props;     
   useEffect(() => {
      doLoginAuto(true);
   }, []) 
    return (
        <Dashboard>
             <UserConsole/>
        </Dashboard>
    )
}


export default connect(mapStateToProps, mapDispatchToProps)(users);