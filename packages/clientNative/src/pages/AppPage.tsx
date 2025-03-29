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

// import * as chapiWalletPolyfill from 'credential-handler-polyfill'

import React, {useEffect} from 'react';
import {LoadWebappInjection} from '@ir-engine/client-core/src/components/LoadWebappInjection';
import {
  AuthState,
  useAuthenticated,
} from '@ir-engine/client-core/src/user/services/AuthService';
import {API, useFind} from '@ir-engine/common';
import config from '@ir-engine/common/src/config';
import {
  clientSettingPath,
  scopePath,
} from '@ir-engine/common/src/schema.type.module';
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView';

import './mui.styles.scss'; /** @todo Remove when MUI is removed */
import './styles.scss';
import {getMutableState, useHookstate} from '@ir-engine/hyperflux';

const ClientSettings = () => {
  const clientSettingQuery = useFind(clientSettingPath);
  const clientSettings = clientSettingQuery.data[0] ?? null;
  useEffect(() => {
    config.client.key8thWall = clientSettings?.key8thWall;
    config.client.mediaSettings = clientSettings?.mediaSettings;
  }, [clientSettings]);

  return <></>;
};

const AppPage = (props: {
  children: React.ReactNode;
  fallback?: JSX.Element;
}) => {
  const isLoggedIn = useAuthenticated();

  const user = useHookstate(getMutableState(AuthState).user).value;

  useEffect(() => {
    if (isLoggedIn) {
      const scopes = API.instance
        .service(scopePath)
        .find({
          query: {
            userId: user.id,
          },
          user,
          paginate: false,
        })
        .then(scopes => {
          console.log('scopes', scopes, user);
        });
    }
  }, [user]);

  return (
    <>
      <LoadWebappInjection fallback={props.fallback}>
        {props.children}
      </LoadWebappInjection>
      {isLoggedIn && <ClientSettings />}
    </>
  );
};

export default AppPage;
