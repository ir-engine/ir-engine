import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { EmptyLayout }from '@xr3ngine/client-core/components/ui/Layout/EmptyLayout';
import AdminConsole from '@xr3ngine/client-core/components/ui/Admin';
import {doLoginAuto} from "@xr3ngine/client-core/redux/auth/service";


interface Props {
    doLoginAuto: any;
}

const mapStateToProps = (state: any): any => {
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
      document.getElementById('__next').classList.add('adminPage');
  }, []);

  return (
      // <ThemeProvider theme={theme}>
        <EmptyLayout>
            <style jsx global> {`
                .adminPage {
                    height: 100%;
                }
            `}</style>
            <AdminConsole />
        </EmptyLayout>
      // </ThemeProvider>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminConsolePage);
