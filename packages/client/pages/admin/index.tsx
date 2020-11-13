import { ThemeProvider } from '@material-ui/core';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Layout from '../../components/ui/Layout';
import theme from '../../theme';
import AdminConsole from '../../components/ui/Admin';


interface Props {
}

const mapStateToProps = (state: any): any => {
  return {
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});

const AdminConsolePage = (props: Props) => {
  return (
      <ThemeProvider theme={theme}>
        <Layout pageTitle='Admin Panel'>
            <AdminConsole />
        </Layout>
      </ThemeProvider>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminConsolePage);
