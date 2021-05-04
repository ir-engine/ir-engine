import Analytics from "@xr3ngine/client-core/src/admin/components/Analytics/index";
import Dashboard from "@xr3ngine/client-core/src/user/components/Dashboard/Dashboard";
import { doLoginAuto } from "@xr3ngine/client-core/src/user/reducers/auth/service";
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

interface Props {
    doLoginAuto?: any;
}

const mapStateToProps = (state: any): any => {
  console.log('====================================');
  console.log(state);
  console.log('====================================');
  return {
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});


const AdminConsolePage = (props: Props) => {
  const { doLoginAuto} = props;

  useEffect(() => {
    doLoginAuto(true);
  }, []);

  return ( <Analytics />);
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminConsolePage);
