/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// import { createHyperStore } from '@ir-engine/hyperflux'
// createHyperStore()
import React, {Suspense, lazy, useEffect} from 'react';
import {SafeAreaView, View, Text} from 'react-native';
import waitForClientAuthenticated from '@ir-engine/client-core/src/util/wait-for-client-authenticated';
import {pipeLogs} from '@ir-engine/common/src/logger';
import {API} from '@ir-engine/common';
import {API as ClientAPI} from '@ir-engine/client-core/src/API';
import {createHyperStore, getMutableState} from '@ir-engine/hyperflux';
import {DomainConfigState} from '@ir-engine/engine/src/assets/state/DomainConfigState';
import config from '@ir-engine/common/src/config';
import {useAuthenticated} from '@ir-engine/client-core/src/user/services/AuthService';

const authenticate = async () => {
  await waitForClientAuthenticated();
};

const initializeLogs = async () => {
  pipeLogs(API.instance);
};

createHyperStore();
ClientAPI.createAPI('marbar');

const publicDomain = config.client.clientUrl;

getMutableState(DomainConfigState).merge({
  publicDomain,
  cloudDomain: config.client.fileServer,
  proxyDomain: config.client.cors.proxyUrl,
});

const LocationPage = lazy(() => import('./src/pages/location/LocationPage'));
const AppPage = lazy(() => import('./src/pages/AppPage'));

function App(): React.JSX.Element {
  useEffect(() => {
    authenticate().then(() => {
      initializeLogs();
      console.log('Authenticated');
    });
  }, []);

  useEffect(() => {
    waitForClientAuthenticated().then(() => {
      console.log('Authenticated');
    });
  });

  const isLoggedIn = useAuthenticated();
  console.log('isLoggedIn', isLoggedIn);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View>
        {isLoggedIn ? (
          <Suspense fallback={<Text>Loading</Text>}>
            <AppPage fallback={<Text>Loading</Text>}>
              <LocationPage />
            </AppPage>
          </Suspense>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default App;
