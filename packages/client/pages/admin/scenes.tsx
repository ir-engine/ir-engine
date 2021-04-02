import React, { useEffect }  from 'react';
import { connect } from 'react-redux';
import Dashboard  from "@xr3ngine/client-core/components/ui/Layout/Dashboard";
import { bindActionCreators, Dispatch } from 'redux';
import {doLoginAuto} from "@xr3ngine/client-core/redux/auth/service";
import ScenesConsole from '@xr3ngine/client-core/components/ui/Admin/Scenes/Scenes';

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

function scenes(props: Props) {
    const { doLoginAuto} = props;
  
    useEffect(() => {
      doLoginAuto(true);
    }, []);

    return (
        <Dashboard>
           <ScenesConsole />
        </Dashboard>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(scenes);
