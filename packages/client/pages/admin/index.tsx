import { ThemeProvider } from '@material-ui/core';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import NoSSR from 'react-no-ssr';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Loading from '../../components/scenes/loading';
import Scene from '../../components/scenes/location';
import EmptyLayout from '../../components/ui/Layout/EmptyLayout';
import { selectAppState } from '../../redux/app/selector';
import { selectAuthState } from '../../redux/auth/selector';
import { doLoginAuto } from '../../redux/auth/service';
import { Admin, Resource, ListGuesser } from 'react-admin';
import { client } from '../../redux/feathers';
import { restClient, authClient } from 'ra-data-feathers';
import { CollectionList } from '../../components/react-admin/Collection/CollectionList';
import { LocationCreate } from '../../components/react-admin/Location/LocationCreate';
import { LocationEdit } from '../../components/react-admin/Location/LocationEdit';
import { LocationList } from '../../components/react-admin/Location/LocationList';
const { publicRuntimeConfig } = getConfig();

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any;
}

import theme from '../../theme';
import {selectLocationState} from "../../redux/location/selector";
import getConfig from "next/config";

interface Props {
  authState?: any;
  doLoginAuto?: typeof doLoginAuto;
  locationState?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    // appState: selectAppState(state),
    // authState: selectAuthState(state),
    // locationState: selectLocationState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
});

const restClientOptions = {
  usePatch: true,
  'location-type': {
    id: 'type'
  }
};

const LocationAdminConsolePage = (props: Props) => {
  const {
    // authState,
    // doLoginAuto,
    locationState,
  } = props;

  // const selfUser = authState.get('user');

  // useEffect(() => {
  //   doLoginAuto(true);
  // }, []);

  return (
    <NoSSR>
      <ThemeProvider theme={theme}>
        <EmptyLayout>
          <Admin
              dataProvider={restClient(client, restClientOptions)}
          >
            <Resource
                name='location'
                create={LocationCreate}
                edit={LocationEdit}
                list={LocationList}
            />
            <Resource
                name='location-settings'
            />
            <Resource
                name='collection'
                list={CollectionList}
            />
            <Resource
                name='location-type'
            />
          </Admin>
        </EmptyLayout>
      </ThemeProvider>
    </NoSSR>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(LocationAdminConsolePage);
