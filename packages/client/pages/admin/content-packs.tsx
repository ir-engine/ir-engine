
import React, { useEffect } from 'react';
import Dashboard from "@xr3ngine/client-core/components/ui/Layout/Dashboard";
import { bindActionCreators, Dispatch } from "redux";
import ContentPackConsole from '@xr3ngine/client-core/components/ui/Admin/ContentPack/ContentPackConsole';
import { doLoginAuto } from '@xr3ngine/client-core/redux/auth/service';
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

 function ContentPacks( props: Props) {
    const { doLoginAuto } = props;     
    useEffect(() => {
       doLoginAuto(true);
    }, []); 
    return (
        <Dashboard>
           <ContentPackConsole/>
        </Dashboard>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPacks);