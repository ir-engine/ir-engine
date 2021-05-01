import React, { useEffect }  from 'react';
import { connect } from 'react-redux';
import Dashboard  from "@xrengine/client-core/src/user/components/Dashboard/Dashboard";
import { bindActionCreators, Dispatch } from 'redux';
import {doLoginAuto} from "@xrengine/client-core/src/user/reducers/auth/service";
import AdminConsole from '@xrengine/client-core/src/admin/components';

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

function locations(props: Props) {
    const { doLoginAuto} = props;
  
    useEffect(() => {
      doLoginAuto(true);
    }, []);

    return (
        <Dashboard>
           <AdminConsole />
        </Dashboard>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(locations);
