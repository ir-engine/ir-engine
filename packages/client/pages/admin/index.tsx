import { ThemeProvider } from '@material-ui/core';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Layout from '../../components/ui/Layout';
import theme from '../../theme';
import AdminConsole from '../../components/ui/Admin';
import {doLoginAuto} from "../../redux/auth/service";


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
  }, []);

  return (
      <ThemeProvider theme={theme}>
        <Layout pageTitle='Admin Panel'>
            <AdminConsole />
        </Layout>
      </ThemeProvider>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminConsolePage);
